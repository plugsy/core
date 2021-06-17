import { ExpressContext } from "apollo-server-express";
import { Operation } from "apollo-server-micro";
import { NextPageContext } from "next";
import { BehaviorSubject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { getItemServer } from "./item-server";

export const initContext =
  (_: NextPageContext | undefined) =>
  (ctx: { operation: Operation } & ExpressContext) => {
    try {
      const { res, req, operation } = ctx;
      const isClosed$ = new BehaviorSubject(false);
      req?.on("close", () => {
        isClosed$.next(true);
      });
      const onClose$ = isClosed$.pipe(filter((isClosed) => isClosed));
      const takeUntilClosed = <T extends any>() => takeUntil<T>(onClose$);
      const { categories$, connectionData$, items$ } = getItemServer();

      return {
        res,
        req,
        operation,
        takeUntilClosed,
        categories$,
        connectionData$,
        items$,
        isClosed$,
      };
    } catch (error) {
      console.error("Unable to init context", error);
      throw error;
    }
  };

export type Context = ReturnType<ReturnType<typeof initContext>>;
