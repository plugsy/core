import next from "next";
import { createServer, Server } from "http";
import express, { Express } from "express";

import { ApolloServer } from "apollo-server-express";
import { serverOptions } from "./schema";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

async function startAPI(httpServer: Server, expressServer: Express) {
  const apolloServer = new ApolloServer({
    ...serverOptions(),
    tracing: true,
    subscriptions: {
      path: "/graphql",
      keepAlive: 9000,
    },
    playground: {
      subscriptionEndpoint: "/graphql",
    },
  });

  apolloServer.applyMiddleware({ app: expressServer, path: "/graphql" });
  apolloServer.installSubscriptionHandlers(httpServer);

  return apolloServer;
}

async function startFrontend(expressServer: Express) {
  const nextApp = next({ dev });
  const nextHandle = nextApp.getRequestHandler();

  expressServer.all("*", (req, res) => nextHandle(req, res));
  await nextApp.prepare();
}

async function startServer() {
  const expressServer = express();
  const httpServer = createServer(expressServer);

  const api = await startAPI(httpServer, expressServer);
  await startFrontend(expressServer);

  await new Promise<void>((resolve) => httpServer.listen(port, resolve));

  async function closeServer() {
    try {
      await api.stop();
    } catch {}
    try {
      httpServer.close(() => {
        console.debug("HTTP server closed");
      });
    } catch {}
  }

  process.on("SIGTERM", closeServer);
  process.on("SIGINT", closeServer);
  return `> Server listening at http://localhost:${port} as ${
    dev ? "development" : process.env.NODE_ENV
  }`;
}

startServer().then(console.log);
