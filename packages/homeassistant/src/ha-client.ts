import {
  EMPTY,
  filter,
  interval,
  mergeMap,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from "rxjs";
import { WebSocketSubject } from "rxjs/webSocket";
import { Logger } from "winston";
import { HassServices } from "home-assistant-js-websocket";

export const createHomeAssistantClient = (
  logger: Logger,
  socket: Observable<WebSocketSubject<unknown> | null>
) => {
  return socket.pipe(
    mergeMap((wss) => {
      if (!wss) return EMPTY;
      let i = 10000;
      const subscribeEvents = () => {
        const id = i++;
        return wss.multiplex(
          () => ({
            id,
            type: "subscribe_events",
          }),
          () => ({
            id: i++,
            type: "unsubscribe_events",
            subscription: id,
          }),
          (evt: any) => evt.id === id
        );
      };

      const callService = ({
        domain,
        service,
        serviceData: service_data,
        target,
      }: {
        domain: string;
        service: string;
        serviceData?: { [key: string]: string | number | string[] | number[] };
        target?: { entityId: string };
      }) => {
        const id = i++;
        const request = {
          id,
          type: "call_service",
          domain,
          service,
          // Optional
          service_data,
          // Optional
          target: target
            ? {
                entity_id: target.entityId,
              }
            : undefined,
        };
        logger.verbose("Calling service", { request });
        const sub = wss.pipe(
          filter((event: any) => event?.id === id),
          take(1)
        );
        wss.next(request);
        return sub;
      };

      const getServices = () => {
        const id = i++;
        const request = {
          id,
          type: "get_services",
        };
        logger.verbose("Getting services", { request });
        const sub = wss.pipe(
          filter((event: any) => event?.id === id),
          take(1)
        );
        wss.next(request);
        return sub as Observable<HassServices>;
      };

      const getStates = () => {
        const id = i++;
        const request = {
          id,
          type: "get_states",
        };
        logger.verbose("Getting states", { request });
        const sub = wss.pipe(
          filter((event: any) => event?.id === id),
          take(1)
        );
        wss.next(request);
        return sub as Observable<HassServices>;
      };

      const ping = () => {
        const id = i++;
        const request = {
          id,
          type: "ping",
        };
        const sub = wss.pipe(
          filter((event: any) => event?.id === id),
          take(1)
        );
        wss.next(request);
        return sub;
      };

      const heartbeat = interval(10000).pipe(
        tap(() => logger.verbose("ping")),
        switchMap(() => ping()),
        tap(() => logger.verbose("pong")),
        switchMap(() => EMPTY)
      );
      return [
        heartbeat,
        of({ subscribeEvents, callService, getServices, getStates, ping }),
      ];
    }),
    switchMap((obs) => obs)
  );
};
