import Docker from "dockerode";

export type ContainerMap = {
  [key: string]: {
    name: string;
    category?: string | null;
    icon?: string | null;
    link?: string | null;
    parents?: string[];
  };
};
interface LabeledParams {
  name: string;
  category: string | null;
  icon: string | null;
  link: string | null;
  parents: string[];
}

interface Params {
  state: "GREY" | "RED" | "YELLOW" | "GREEN";
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

export async function getDockerContainers(
  docker: Docker,
  labelConfig: LabelConfig,
  containerMap: ContainerMap
) {
  const containers = await docker.listContainers({ all: true });

  const labeledContainers = containers.map((container): DockerContainer => {
    return {
      state: dockerStateToStatus(container.State),
      status: container.State,
      name: container.Labels[labelConfig.nameLabel] ?? null,
      category: container.Labels[labelConfig.categoryLabel] ?? null,
      icon: container.Labels[labelConfig.iconLabel] ?? null,
      link: container.Labels[labelConfig.linkLabel] ?? null,
      parents: container.Labels[labelConfig.parentsLabel]?.split(",") ?? [],
    };
  });

  const mappedContainers = Object.entries(containerMap).reduce<
    DockerContainer[]
  >((prev, [key, item]) => {
    const container = containers.find((container) =>
      container.Names.some((name) => name.indexOf(key) !== -1)
    );

    if (container) {
      return [
        ...prev,
        {
          name: item.name,
          category: item.category ?? null,
          icon: item.icon ?? null,
          link: item.link ?? null,
          parents: item.parents ?? [],
          state: dockerStateToStatus(container.State),
          status: container.State,
        },
      ];
    } else {
      console.debug(`Couldn't find mapped docker container: ${key}`);
    }

    return prev;
  }, []);

  return [...labeledContainers, ...mappedContainers].filter(
    (container) => container.name !== null
  );
}
