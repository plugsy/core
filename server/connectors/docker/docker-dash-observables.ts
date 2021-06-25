import Docker, { DockerOptions } from "dockerode";
import { BehaviorSubject, defer, Observable, ReplaySubject, timer } from "rxjs";
import { catchError, map, share, switchMap, tap } from "rxjs/operators";
import { ConnectionData, Item } from "../model";
import { Logger } from "winston";
import {
  ContainerMap,
  getDockerContainers,
  LabelConfig,
} from "./docker-containers";

const CONNECTOR_TYPE = "DOCKER";
export type DOCKER_CONNECTOR_TYPE = typeof CONNECTOR_TYPE;

export interface DockerConnectionConfig {
  id?: string;
  dockerOptions?: Omit<DockerOptions, "Promise">;
  interval?: number;
  labelConfig?: Partial<LabelConfig>;
  containerMap?: ContainerMap;
}

export const dockerConnection = (
  {
    id = CONNECTOR_TYPE,
    dockerOptions,
    interval = 20000,
    labelConfig,
    containerMap = {},
  }: DockerConnectionConfig,
  logger: Logger
) => {
  logger = logger.child({
    component: "dockerConnection",
    id,
  });
  logger.verbose("init");
  let docker: Docker | null = null;

  const latest = new BehaviorSubject<ConnectionData>({
    id,
    connected: false,
    lastUpdated: null,
    items: [],
    error: null,
  });

  const connection: Observable<ConnectionData> = defer(() =>
    timer(0, interval)
  ).pipe(
    switchMap(async () => {
      if (!docker) {
        logger.verbose("createDockerInstance");
        docker = new Docker(
          dockerOptions ?? { socketPath: "/var/run/docker.sock" }
        );
      }
      logger.verbose("ping");
      await docker.ping();
      return docker;
    }),
    switchMap((docker) =>
      getDockerContainers(
        docker,
        {
          nameLabel: labelConfig?.nameLabel ?? "dockerDash.name",
          categoryLabel: labelConfig?.categoryLabel ?? "dockerDash.category",
          iconLabel: labelConfig?.iconLabel ?? "dockerDash.icon",
          linkLabel: labelConfig?.linkLabel ?? "dockerDash.link",
          parentsLabel: labelConfig?.parentsLabel ?? "dockerDash.parents",
        },
        containerMap,
        logger
      )
    ),
    tap((containers) =>
      logger.verbose("foundContainers", {
        count: containers.length,
      })
    ),
    map((containers): Item[] =>
      containers.map(
        ({ category, icon, link, state, parents, status, name }) => ({
          connectorType: CONNECTOR_TYPE,
          name,
          state,
          status,
          category,
          parents,
          icon: icon ?? null,
          link: link ?? null,
        })
      )
    ),
    map(
      (items): ConnectionData => ({
        id,
        connected: true,
        lastUpdated: new Date(),
        items,
        error: null,
      })
    ),
    tap((data) => latest.next(data)),
    catchError((err) => {
      const errorMessage = err?.message ?? err.toString();
      logger.error("fail", {
        error: errorMessage,
      });
      return latest.pipe(
        map(
          (data): ConnectionData => ({
            ...data,
            connected: false,
            error: errorMessage,
          })
        )
      );
    }),
    tap({
      complete: () => logger.debug("complete"),
    }),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: true,
    })
  );

  return connection;
};
