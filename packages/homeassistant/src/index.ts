import { createLogger } from "@plugsy/common";
import {
  HomeAssistantWebSocketConfig,
  createHomeAssistantWebSocket,
} from "./ha-socket";
import { catchError, EMPTY, of, switchMap } from "rxjs";
import { createHomeAssistantClient } from "./ha-client";

const HOME_ASSISTANT_LONG_LIVED_CODE =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI2ZTc4Y2Q5MWYxM2E0OWRhOWIxM2E4YzIyY2UwYzFkOCIsImlhdCI6MTYzODM2MzQ5MSwiZXhwIjoxOTUzNzIzNDkxfQ.2xbQbhPivKf7b931XT26TzOKd3FMX3_cQPw28GPCK48";

const logger = createLogger("silly");
const haWebSocket = createHomeAssistantWebSocket(
  logger.child({ component: "haWebSocket" }),
  of({
    longLivedAccessToken: HOME_ASSISTANT_LONG_LIVED_CODE,
    url: "http://192.168.96.15:8123",
  } as HomeAssistantWebSocketConfig)
);
const haClient = createHomeAssistantClient(
  logger.child({ component: "haClient" }),
  haWebSocket
);

haClient
  .pipe(
    catchError((error) => {
      logger.error("An error occurred", { error });
      return EMPTY;
    }),
    switchMap(({ ping }) => {
      return ping();
    })
  )
  .subscribe({
    complete: () => logger.info("Complete"),
    error: (error) => logger.error("An error occurreed", { error }),
    next: (response) => logger.info("New response", { response }),
  });
