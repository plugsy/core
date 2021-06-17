import { readFile } from "fs/promises";
import { Validator } from "jsonschema";
import schema from "./schema.json";
import { fileWatchObservable } from "../../../../utils/file-watch-observable";
import { ConnectorConfig } from "../connectors";
import { environment } from "../../../../environment";
import { catchError, map, switchMap } from "rxjs/operators";
import { BehaviorSubject, EMPTY, from } from "rxjs";

export interface ServerConfig {
  connectors: ConnectorConfig[] | ConnectorConfig;
}

async function getConfigFileContents() {
  return readFile(environment().localConfigFile);
}

const schemaValidator = new Validator();

export function getServerConfig() {
  const defaultConfig = new BehaviorSubject<ServerConfig>({
    connectors: [
      {
        type: "docker",
        config: {
          id: "docker",
        },
      },
    ],
  });
  try {
    return fileWatchObservable(environment().localConfigFile).pipe(
      switchMap(() => from(getConfigFileContents())),
      map((buffer) => JSON.parse(buffer.toString("utf-8"))),
      map((config) => {
        schemaValidator.validate(config, schema, { throwAll: true });
        return config as ServerConfig;
      }),
      catchError((error) => {
        console.error(error);
        console.error("You can edit your config file to trigger a reload");
        return EMPTY;
      })
    );
  } catch (error) {
    console.error(`Unable to watch config file. Does it exist?
    Reverting to /var/run/docker.sock`);
    return defaultConfig;
  }
}
