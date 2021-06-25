import { readFile as _readFile, exists as _exists } from "fs";
import { promisify } from "util";
import { Validator } from "jsonschema";
import schema from "./config-schema.json";
import { AgentConfig } from "./agent";
import { fileWatchObservable } from "./utils/file-watch-observable";
import { ConnectorConfig } from "./connectors";
import { environment } from "./environment";
import { catchError, debounceTime, map, switchMap, tap } from "rxjs/operators";
import { BehaviorSubject, concat, EMPTY, from, of } from "rxjs";
import { Logger } from "winston";
const exists = promisify(_exists);
const readFile = promisify(_readFile);


export interface ServerConfig {
  agent?: AgentConfig;
  connectors: ConnectorConfig[] | ConnectorConfig;
}

async function getConfigFileContents() {
  return readFile(environment().localConfigFile);
}

const schemaValidator = new Validator();

export function getServerConfig(filePath: string, logger: Logger) {
  logger = logger.child({
    component: "getServerConfig",
  });
  logger.verbose("init");
  const defaultConfig = new BehaviorSubject<ServerConfig>({
    connectors: [
      {
        type: "DOCKER",
        config: {},
      },
    ],
  });

  return from(exists(filePath)).pipe(
    switchMap((fileExists) => {
      if (fileExists) {
        logger.verbose("loadConfigFile", {
          message: "File exists, attempting to load file config",
        });
        return from(getConfigFileContents()).pipe(
          switchMap((contents) =>
            concat(
              of(contents),
              fileWatchObservable(filePath).pipe(
                tap({
                  next: () => logger.verbose("readFileContents"),
                  complete: () => logger.verbose("readFileContents.complete"),
                }),
                switchMap(() => from(getConfigFileContents())),
                catchError((error) => {
                  logger.error("readFileContents.fail", {
                    error: error?.message ?? error.toString(),
                    message:
                      "You can edit your config file to trigger a reload",
                  });
                  return EMPTY;
                })
              )
            )
          ),
          debounceTime(1000),
          switchMap((cfg) =>
            of(cfg).pipe(
              tap({
                next: () => logger.verbose("loadFile"),
                complete: () => logger.verbose("loadFile.complete"),
              }),
              map((buffer) => JSON.parse(buffer.toString("utf-8"))),
              map((config) => {
                logger.verbose("validateSchema");
                const result = schemaValidator.validate(config, schema);
                if (result.errors.length) {
                  logger.error("validateSchema.fail", {
                    errors: result.errors,
                    message: `There is an error in your config file, make sure you're following the schema correctly (This can be made easier by using the schema in your json file and an IDE)`,
                  });
                  throw new Error();
                }
                return config as ServerConfig;
              }),
              catchError((error) => {
                logger.error("readFileContents.fail", {
                  message: "You can edit your config file to trigger a reload",
                  error: error?.message ?? error.toString(),
                });
                return EMPTY;
              })
            )
          )
        );
      }

      logger.verbose("skipConfigFile", {
        message: `Unable to watch config file. Does it exist?
        Reverting to /var/run/docker.sock`,
      });
      return defaultConfig;
    })
  );
}
