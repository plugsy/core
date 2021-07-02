import { ExpressContext } from "apollo-server-express";
import { Operation } from "apollo-server-micro";
import { NextPageContext } from "next";
import { BehaviorSubject, Observable } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import type { ConnectionPool } from "../../connection-pool";
import type { ItemServer } from "../../item-server";
import { Logger } from "winston";
import { nanoid } from "nanoid";

export interface ContextDependencies {
  ctx?: NextPageContext;
  theme$: Observable<any>;
  itemServer: ItemServer;
  connectionPool: ConnectionPool;
  logger: Logger;
}

export const initContext = ({
  logger,
  itemServer,
  connectionPool,
  theme$,
}: ContextDependencies) => {
  logger = logger.child({ component: "initContext" });
  return (ctx: { operation: Operation } & ExpressContext) => {
    const requestLogger = logger.child({ request: nanoid(8) });
    logger.verbose("initContext");
    try {
      const { res, req, operation } = ctx;
      const isClosed$ = new BehaviorSubject(false);
      req?.on("close", () => {
        requestLogger.verbose("requestClose");
        isClosed$.next(true);
      });
      const onClose$ = isClosed$.pipe(filter((isClosed) => isClosed));
      const takeUntilClosed = <T extends any>() => takeUntil<T>(onClose$);
      return {
        res,
        req,
        requestLogger,
        operation,
        takeUntilClosed,
        itemServer,
        connectionPool,
        isClosed$,
        theme$,
      };
    } catch (error) {
      logger.error("initContext.fail", {
        error: error?.message ?? error.toString(),
        message: "Unable to init context",
      });
      throw error;
    }
  };
};

export type Context = ReturnType<ReturnType<typeof initContext>>;
