import Docker, { DockerOptions } from "dockerode";
import { BehaviorSubject, defer, ReplaySubject, timer } from "rxjs";
import { catchError, map, share, switchMap, tap } from "rxjs/operators";
import { Connection, ConnectionData, Item } from "../model";
import { getDockerContainers, LabelConfig } from "./docker-containers";

export interface DockerConnectionConfig {
  id?: string;
  dockerOptions?: DockerOptions;
  interval?: number;
  labelConfig?: Partial<LabelConfig>;
}

export const dockerConnection = ({
  id = "docker",
  dockerOptions,
  interval = 5000,
  labelConfig,
}: DockerConnectionConfig) => {
  let docker: Docker | null = null;

  async function getDocker(config: DockerOptions): Promise<Docker> {
    docker = docker ?? new Docker(config);
    await docker.ping();
    return docker;
  }
  
  const latest = new BehaviorSubject<ConnectionData>({
    id,
    connected: false,
    lastUpdated: null,
    items: [],
    error: null,
  });

  const connection: Connection = defer(() => timer(0, interval)).pipe(
    switchMap(() =>
      getDocker(dockerOptions ?? { socketPath: "/var/run/docker.sock" })
    ),
    switchMap((docker) =>
      getDockerContainers(docker, {
        nameLabel: labelConfig?.nameLabel ?? "dockerDash.name",
        categoryLabel: labelConfig?.categoryLabel ?? "dockerDash.category",
        iconLabel: labelConfig?.iconLabel ?? "dockerDash.icon",
        linkLabel: labelConfig?.linkLabel ?? "dockerDash.link",
        parentsLabel: labelConfig?.parentsLabel ?? "dockerDash.parents",
      })
    ),
    map((containers): Item[] =>
      containers.map(
        ({ category, icon, link, state, parents, status, name }) => ({
          name,
          state,
          status,
          category,
          icon: icon ?? null,
          link: link ?? null,
          parents: parents?.split(",") ?? [],
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
    catchError((err) =>
      latest.pipe(
        map(
          (data): ConnectionData => ({
            ...data,
            connected: false,
            error: err.toString() as string,
          })
        )
      )
    ),
    share({
      connector: () => new ReplaySubject(1),
      resetOnComplete: false,
      resetOnError: false,
      resetOnRefCountZero: true,
    })
  );

  return connection;
};
