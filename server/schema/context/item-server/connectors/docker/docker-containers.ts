import Docker from "dockerode";

interface LabeledParams {
  name: string;
  category: string | null;
  icon: string | null;
  link: string | null;
  parents: string | null;
}

interface Params {
  state: 'GREY' | 'RED' | 'YELLOW' | 'GREEN';
  status: string;
}

export interface DockerContainer extends Params, LabeledParams {}

export type LabelConfig = { [name in `${keyof LabeledParams}Label`]: string };

export async function getRunningDockerContainerCount(docker: Docker) {
  return (await docker.listContainers()).length;
}

const dockerStateToStatus = (state: string) => {
  switch (state) {
    case "created":
    case "paused":
    case "exited":
      return "GREY";
    case "unknown":
    case "dead":
      return "RED";
    case "removing":
    case "restarting":
      return "YELLOW";
    case "running":
      return "GREEN";
    default:
      console.warn("Un-mapped docker state found: ", state);
      return "GREY";
  }
};

export async function getDockerContainers(docker: Docker, config: LabelConfig) {
  const containers = await docker.listContainers({ all: true });

  return containers
    .map((container): DockerContainer => {
      
      return {
        state: dockerStateToStatus(container.State),
        status: container.State,
        name: container.Labels[config.nameLabel] ?? null,
        category: container.Labels[config.categoryLabel] ?? null,
        icon: container.Labels[config.iconLabel] ?? null,
        link: container.Labels[config.linkLabel] ?? null,
        parents: container.Labels[config.parentsLabel] ?? null,
      };
    })
    .filter((container) => container.name !== null);
}
