import {
  map,
  Observable,
  of,
  switchMap,
  tap,
  from,
  catchError,
  EMPTY,
  BehaviorSubject,
} from "rxjs";
import WebSocket from "ws";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { Logger } from "winston";
import { Auth, createLongLivedTokenAuth } from "home-assistant-js-websocket";

export interface HomeAssistantWebSocketConfig {
  url: string;
  longLivedAccessToken: string;
}

type AuthResponseMessageType = "auth_required" | "auth_invalid" | "auth_ok";
type AuthMessage = { type: AuthResponseMessageType };

function isAuthMessage(message: any): message is AuthMessage {
  const type: string | undefined = message?.type;
  return (
    type === "auth_required" || type === "auth_invalid" || type === "auth_ok"
  );
}

const createAuthHandler = (
  logger: Logger,
  auth: Auth,
  wss: WebSocketSubject<any>
) => {
  const hasAuthed$ = new BehaviorSubject(false);
  return (event: any) => {
    if (!isAuthMessage(event)) {
      return EMPTY;
    }

    switch (event.type) {
      case "auth_ok":
        hasAuthed$.next(true);
        logger.info("Auth successful", { event });
        break;

      case "auth_required":
        hasAuthed$.next(false);
        logger.verbose("Sending Auth");
        wss.next({
          type: "auth",
          access_token: auth.accessToken,
        });
        break;

      case "auth_invalid":
        hasAuthed$.next(false);
        logger.error("Invalid auth, will attempt a refresh", { event });
        return from(auth.refreshAccessToken()).pipe(
          catchError((error) => {
            logger.error(
              "Error refreshing access token, this will also happen if your long lived token is wrong.",
              { error }
            );
            return of(false);
          }),
          switchMap(() => {
            logger.verbose("Refreshed access token");
            wss.next({
              type: "auth",
              access_token: auth.accessToken,
            });
            return hasAuthed$;
          })
        );
    }
    return hasAuthed$;
  };
};

export const createHomeAssistantWebSocket = (
  logger: Logger,
  config: Observable<HomeAssistantWebSocketConfig>
) => {
  return config.pipe(
    map(({ url, ...rest }) => {
      const normalizedUrl = url.endsWith("/")
        ? url.substr(0, url.length - 1)
        : url;
      const wssUrl = `ws${url.substr(4)}/api/websocket`;
      return {
        url: normalizedUrl,
        wssUrl,
        ...rest,
      };
    }),
    tap((config) => logger.debug("config", config)),
    switchMap(({ longLivedAccessToken, url, ...rest }) => {
      const auth = createLongLivedTokenAuth(url, longLivedAccessToken);
      return of({ auth, url, ...rest });
    }),
    switchMap((config) => {
      const websocketSubject = webSocket({
        WebSocketCtor: WebSocket,
        url: config.wssUrl,
      });
      return of([websocketSubject, config] as const);
    }),
    switchMap(([wss, { auth }]) => {
      const isAuthed = createAuthHandler(
        logger.child({ component: "AuthHandler" }),
        auth,
        wss
      );
      return wss.pipe(
        switchMap(isAuthed),
        map((authed) => {
          if (authed) return wss;
          return null;
        })
      );
    })
  );
};
