import { ExpressContext, Operation } from "apollo-server-express";
import { NextPageContext } from "next";
import { Observable } from "rxjs";
import { Logger } from "winston";
import { nanoid } from "nanoid";

export interface ContextDependencies {
  ctx?: NextPageContext;
  theme$: Observable<any>;
  logger: Logger;
}

export const initContext = ({ logger, theme$ }: ContextDependencies) => {
  logger = logger.child({ component: "initContext" });
  return (ctx: { operation: Operation } & ExpressContext) => {
    const requestLogger = logger.child({ request: nanoid(8) });
    logger.verbose("initContext");
    try {
      const { res, req, operation } = ctx;
      return {
        res,
        req,
        requestLogger,
        operation,
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
