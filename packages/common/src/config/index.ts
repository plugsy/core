import { readFile as _readFile, exists as _exists } from "fs";
import { promisify } from "util";
import { Schema, Validator } from "jsonschema";
import { fileWatchObservable } from "../utils/file-watch-observable";
import {
  catchError,
  debounceTime,
  map,
  share,
  switchMap,
  tap,
} from "rxjs/operators";
import { BehaviorSubject, concat, EMPTY, from, of, ReplaySubject } from "rxjs";
import { Logger } from "winston";
const exists = promisify(_exists);
const readFile = promisify(_readFile);

const schemaValidator = new Validator();

export function loadConfig<T extends any>(
  filePath: string,
  logger: Logger,
  defaultConfig: T,
  validations: { name: string; schema: Schema }[]
) {
  logger.verbose("init");
  const defaultConfig$ = new BehaviorSubject<T>(defaultConfig).pipe(
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: true,
      resetOnError: true,
      resetOnRefCountZero: true,
    })
  );

  return from(exists(filePath)).pipe(
    switchMap((fileExists) => {
      if (fileExists) {
        logger.verbose("loadConfigFile", {
          message: "File exists, attempting to load file config",
        });
        return from(readFile(filePath)).pipe(
          switchMap((contents) =>
            concat(
              of(contents),
              fileWatchObservable(filePath).pipe(
                tap({
                  next: () => logger.verbose("readFileContents"),
                  complete: () => logger.verbose("readFileContents.complete"),
                }),
                switchMap(() => from(readFile(filePath))),
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
                validations.forEach(({ schema, name }) => {
                  logger.verbose("validateSchema", { name });
                  const result = schemaValidator.validate(config, schema);
                  if (result.errors.length) {
                    logger.error("validateSchema.fail", {
                      name,
                      errors: result.errors,
                      message: `There is an error in your config file, make sure you're following the schema correctly (This can be made easier by using the schema in your json file and an IDE)`,
                    });
                    throw new Error();
                  }
                });
                return config as T;
              }),
              catchError((error) => {
                logger.error("readFileContents.fail", {
                  message: "You can edit your config file to trigger a reload",
                  error: error?.message ?? error.toString(),
                });
                return EMPTY;
              })
            )
          ),
          share({
            connector: () => new ReplaySubject(1),
            resetOnComplete: true,
            resetOnError: true,
            resetOnRefCountZero: true,
          })
        );
      }

      logger.verbose("skipConfigFile", {
        message: `Unable to watch config file. Does it exist?
        Reverting to /var/run/docker.sock`,
      });
      return defaultConfig$;
    })
  );
}
