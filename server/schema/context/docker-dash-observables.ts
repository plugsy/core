import { DockerOptions } from "dockerode";
import {
  BehaviorSubject,
  defer,
  Observable,
  ReplaySubject,
  Subscriber,
  timer,
} from "rxjs";
import { catchError, map, share, switchMap, tap } from "rxjs/operators";
import { Container, ContainerState } from "../typeDefs";
import { getDocker } from "./docker";
import { getDockerContainers, LabelConfig } from "./docker-containers";

export interface DockerDashContainer extends Omit<Container, "children"> {
  parents: string[];
}

export interface DockerDashContainerData {
  connected: boolean;
  lastUpdated: Date | null;
  containers: DockerDashContainer[];
  error: string | null;
}

export interface DockerDashCategory {
  name: string;
  containers: DockerDashContainer[];
}
function subscriberCount<T>(
  sourceObservable: Observable<T>,
  _: string
) {
  // let counter = 0;
  return new Observable((subscriber: Subscriber<T>) => {
    const subscription = sourceObservable.subscribe(subscriber);
    // counter++;
    // console.debug(`${description} subscriptions: ${counter}`);

    return () => {
      subscription.unsubscribe();
      // counter--;
      // console.debug(`${description} subscriptions: ${counter}`);
    };
  });
}
export const dockerDashObservables = (
  dockerOptions: DockerOptions,
  labelConfig: LabelConfig
) => {
  const latest = new BehaviorSubject<DockerDashContainerData>({
    connected: false,
    lastUpdated: null,
    containers: [],
    error: null,
  });

  const data$ = subscriberCount(
    defer(() => timer(0, 5000)).pipe(
      switchMap(() => getDocker(dockerOptions)),
      switchMap((docker) => getDockerContainers(docker, labelConfig)),
      map((containers): DockerDashContainer[] =>
        containers.map(
          ({ category, icon, link, state, parents, ...container }) => ({
            ...container,
            parents: parents?.split(",") ?? [],
            state: (() => {
              switch (state) {
                case "created":
                  return ContainerState.Created;
                case "dead":
                  return ContainerState.Dead;
                case "exited":
                  return ContainerState.Exited;
                case "paused":
                  return ContainerState.Paused;
                case "restarting":
                  return ContainerState.Restarting;
                case "running":
                  return ContainerState.Running;
                case "removing":
                  return ContainerState.Removing;
                case "unknown":
                  return ContainerState.Unknown;
              }
            })(),
            category: category,
            icon: icon ?? undefined,
            link: link ?? undefined,
          })
        )
      ),
      map(
        (containers): DockerDashContainerData => ({
          connected: true,
          lastUpdated: new Date(),
          containers,
          error: null,
        })
      ),
      tap((data) => latest.next(data)),
      catchError((err) =>
        latest.pipe(
          map(
            (data): DockerDashContainerData => ({
              ...data,
              connected: false,
              error: err.toString() as string,
            })
          )
        )
      ),
      share({
        resetOnComplete: false,
        resetOnError: false,
        resetOnRefCountZero: true,
      })
    ),
    "Root docker data"
  );

  const containers$ = subscriberCount(
    data$.pipe(
      map(({ containers }) => containers),
      share({
        connector: () => new ReplaySubject(1),
        resetOnComplete: false,
        resetOnError: false,
        resetOnRefCountZero: true,
      })
    ),
    "Containers"
  );

  const categories$ = subscriberCount(
    data$.pipe(
      map(({ containers }): DockerDashCategory[] =>
        containers
          .reduce<DockerDashCategory[]>((categories, container) => {
            if (!container.category) return categories;
            const existingCategory = categories.find(
              (category) => category.name === container.category
            );
            if (existingCategory) {
              existingCategory.containers = [
                ...existingCategory.containers,
                container,
              ];
              return categories;
            }
            return [
              ...categories,
              { name: container.category, containers: [container] },
            ];
          }, [])
          .map(({ containers, ...rest }) => ({
            ...rest,
            containers: containers.sort((a, b) => {
              if (!a.name) return 1;
              if (!b.name) return -1;
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            }),
          }))
          .sort((a, b) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          })
      ),
      share({
        connector: () => new ReplaySubject(1),
        resetOnComplete: false,
        resetOnError: false,
        resetOnRefCountZero: true,
      })
    ),
    "Categories"
  );

  const connected$ = subscriberCount(
    data$.pipe(map((containers) => containers.connected)),
    "connected"
  );
  const lastUpdated$ = subscriberCount(
    data$.pipe(map((containers) => containers.lastUpdated)),
    "lastUpdated"
  );

  const error$ = subscriberCount(
    data$.pipe(map((containers) => containers.error)),
    "errors"
  );

  return {
    connected$,
    lastUpdated$,
    containers$,
    categories$,
    error$,
  };
};
