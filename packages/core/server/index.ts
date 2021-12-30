import next from "next";
import { createServer } from "http";
import express, { Express } from "express";
import { Logger } from "winston";

import { loadConfig, createLogger } from "@plugsy/common";
import { filter, map, share } from "rxjs/operators";
import {
  ConnectorPlugin,
  DEFAULT_CONNECTOR_PLUGIN_CONFIG,
} from "@plugsy/connectors";
import { environment } from "./environment";
import { ReplaySubject } from "rxjs";
import schema from "./config-schema.json";
import {
  ComponentConfig,
  createPluginServer,
  PluginConfig,
  ThemeConfig,
} from "@plugsy/schema/server";
import { registerIconHandler } from "./handlers/icon-handler";

const { port, dev } = environment();

export interface ServerConfig {
  loggingLevel?: string;
  plugins: PluginConfig<any, any>[];
  components: ComponentConfig[];
  theme?: ThemeConfig;
}

async function tryQuietly(fn: () => any | Promise<any>) {
  return async () => {
    try {
      await fn();
    } catch {}
  };
}

function watchConfig(filePath: string, logger: Logger) {
  logger = logger.child({
    component: "watchConfig",
  });
  const config$ = loadConfig<ServerConfig>(
    filePath,
    logger,
    {
      components: [],
      plugins: [
        {
          type: "connectors",
          config: DEFAULT_CONNECTOR_PLUGIN_CONFIG,
        },
      ],
    },
    [
      {
        name: "Config",
        schema,
      },
    ]
  ).pipe(
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: true,
      resetOnError: true,
      resetOnRefCountZero: true,
    })
  );

  const loggingLevel$ = config$.pipe(
    map((config) => config.loggingLevel),
    filter(Boolean)
  );
  return {
    loggingLevel$,
    config$,
  };
}

async function startFrontend(expressServer: Express) {
  const nextApp = next({ dev });
  const nextHandle = nextApp.getRequestHandler();

  expressServer.all("*", (req, res) => nextHandle(req, res));
  await nextApp.prepare();
  return nextApp;
}

async function startServer() {
  const { localConfigFile, loggingLevel } = environment();
  const logger = createLogger(loggingLevel);
  logger.verbose("watchConfig");
  const { config$, loggingLevel$ } = watchConfig(localConfigFile, logger);

  const loggingLevelSubscription = loggingLevel$.subscribe(
    (level) => (logger.level = level)
  );

  const expressServer = express();
  const httpServer = createServer(expressServer);

  registerIconHandler(expressServer);
  const pluginServer = createPluginServer({
    logger: logger.child({ component: "createPluginServer" }),
    config$,
    expressServer,
    httpServer,
    plugins: {
      test: ConnectorPlugin,
    },
  });

  logger.verbose("startFrontend");
  const frontend = await startFrontend(expressServer);

  logger.verbose("listen");
  await new Promise<void>((resolve) => httpServer.listen(port, resolve));

  async function closeServer() {
    logger.info("Stopping Server");
    await tryQuietly(frontend.close);
    await tryQuietly(loggingLevelSubscription.unsubscribe);
    await tryQuietly(pluginServer.unsubscribe);
    await tryQuietly(() =>
      httpServer.close(() => logger.info("HTTP Server Closed"))
    );
    logger.info("Server Stopped");
    process.exit(0);
  }

  process.on("SIGTERM", closeServer);
  process.on("SIGINT", closeServer);
  logger.info(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
}

startServer();
