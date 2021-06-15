import next from "next";
import { createServer } from "http";
import express from "express";

import { ApolloServer } from "apollo-server-express";
import { serverOptions } from "./schema";

const apolloServer = new ApolloServer({
  ...serverOptions(),
  tracing: true,
  subscriptions: {
    path: "/graphql",
    keepAlive: 9000,
    onConnect: () => console.log("connected"),
    onDisconnect: () => console.log("disconnected"),
  },
  playground: {
    subscriptionEndpoint: "/graphql",
  },
});

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

async function startServer() {
  const nextApp = next({ dev });
  const nextHandle = nextApp.getRequestHandler();

  await nextApp.prepare();
  const expressServer = express();

  apolloServer.applyMiddleware({ app: expressServer, path: "/graphql" });
  const httpServer = createServer(expressServer);
  apolloServer.installSubscriptionHandlers(httpServer);
  expressServer.all("*", (req, res) => nextHandle(req, res));
  await new Promise<void>((resolve) => httpServer.listen(port, resolve));

  // tslint:disable-next-line:no-console
  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );

  async function closeServer() {
    try {
      await apolloServer.stop();
    } catch {}
    try {
      httpServer.close(() => {
        console.debug("HTTP server closed");
      });
    } catch {}
  }

  process.on("SIGTERM", closeServer);
  process.on("SIGINT", closeServer);
}

startServer().then(console.log);
