import { ExpressContext } from "apollo-server-express";
import { Operation } from "apollo-server-micro";
import { NextPageContext } from "next";
import { BehaviorSubject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { environment } from "../../environment";
import { dockerDashObservables } from "./docker-dash-observables";
import { fileStorage, nullStorage } from "./storage";

const {
  fileStoragePath,
  dockerHost,
  dockerPort,
  dockerProtocol,
  dockerSocket,
  dockerVersion,
  categoryLabel,
  nameLabel,
  iconLabel,
  linkLabel,
  parentsLabel,
} = environment();

const dockerDashData$ = dockerDashObservables(
  {
    host: dockerHost,
    protocol: dockerProtocol,
    socketPath: dockerSocket,
    version: dockerVersion,
    port: dockerPort,
  },
  {
    categoryLabel,
    nameLabel,
    iconLabel,
    linkLabel,
    parentsLabel,
  }
);

export const initContext =
  (_: NextPageContext | undefined) =>
  (ctx: { operation: Operation } & ExpressContext) => {
    try {
      const { res, req, operation } = ctx;
      const isClosed$ = new BehaviorSubject(false);
      console.log(ctx.connection?.context);
      req?.on("close", () => {
        isClosed$.next(true);
      });
      const onClose$ = isClosed$.pipe(filter((isClosed) => isClosed));
      const takeUntilClosed = <T extends any>() => takeUntil<T>(onClose$);
      const categories$ = dockerDashData$.categories$.pipe(takeUntilClosed());
      const connected$ = dockerDashData$.connected$.pipe(takeUntilClosed());
      const error$ = dockerDashData$.error$.pipe(takeUntilClosed());
      const containers$ = dockerDashData$.containers$.pipe(takeUntilClosed());
      const lastUpdated$ = dockerDashData$.lastUpdated$.pipe(takeUntilClosed());

      const store = fileStoragePath
        ? fileStorage({ path: fileStoragePath })
        : nullStorage;

      return {
        res,
        req,
        operation,
        store,
        takeUntilClosed,
        categories$,
        connected$,
        error$,
        containers$,
        lastUpdated$,
        isClosed$,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

export type Context = ReturnType<ReturnType<typeof initContext>>;
