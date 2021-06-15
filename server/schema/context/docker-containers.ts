import { parse } from "date-fns";
import Docker from "dockerode";
import fs from "fs";
import path from "path";

interface LabeledParams {
  name: string;
  category: string | null;
  icon: string | null;
  link: string | null;
  parents: string | null;
}

interface Params {
  state: State;
  extra: {
    names: string[];
    status: string;
    created: Date;
  };
}

export interface DockerContainer extends Params, LabeledParams {}

export type LabelConfig = { [name in `${keyof LabeledParams}Label`]: string };

export async function getRunningDockerContainerCount(docker: Docker) {
  return (await docker.listContainers()).length;
}

export type State =
  | "created"
  | "exited"
  | "running"
  | "restarting"
  | "dead"
  | "paused"
  | "removing"
  | "unknown";

export async function getDockerContainers(docker: Docker, config: LabelConfig) {
  const containers = await docker.listContainers({ all: true });
  const fileContent = JSON.stringify(containers, null, 4);

  fs.writeFileSync(path.join(".", `file.json`), fileContent, {
    encoding: "utf8",
    flag: "w",
  });
  return containers
    .map((container): DockerContainer => {
      const state: State = (() => {
        switch (container.State) {
          case "created":
          case "exited":
          case "running":
          case "restarting":
          case "dead":
          case "paused":
          case "removing":
            return container.State;
          default:
            console.warn("Un-mapped docker state found: ", container.State);
            return "unknown";
        }
      })();
      return {
        state,
        name: container.Labels[config.nameLabel] ?? null,
        category: container.Labels[config.categoryLabel] ?? null,
        icon: container.Labels[config.iconLabel] ?? null,
        link: container.Labels[config.linkLabel] ?? null,
        parents: container.Labels[config.parentsLabel] ?? null,
        extra: {
          names: container.Names,
          status: container.Status,
          created: parse(`${container.Created}`, "t", new Date()),
        },
      };
    })
    .filter((container) => container.name !== null);
}
