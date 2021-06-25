import Docker from "dockerode";
import { Logger } from "winston";

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

const dockerStateToStatus = (state: string, logger: Logger) => {
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
      logger.warn("dockerStateToStatus.unknownDockerState", {
        state,
        message: `Unknown docker state found: ${state}`,
      });
      return "GREY";
  }
};

export async function getDockerContainers(
  docker: Docker,
  labelConfig: LabelConfig,
  containerMap: ContainerMap,
  logger: Logger
) {
  logger = logger.child({ component: "getDockerContainers" });
  logger.verbose("getDockerContainers");
  const containers = await docker.listContainers({ all: true });

  logger.silly("containers", {
    containers,
  });

  const labeledContainers = containers.map((container): DockerContainer => {
    return {
      state: dockerStateToStatus(container.State, logger),
      status: container.State,
      name: container.Labels[labelConfig.nameLabel] ?? null,
      category: container.Labels[labelConfig.categoryLabel] ?? null,
      icon: container.Labels[labelConfig.iconLabel] ?? null,
      link: container.Labels[labelConfig.linkLabel] ?? null,
      parents: container.Labels[labelConfig.parentsLabel]?.split(",") ?? [],
    };
  });

  logger.silly("labeledContainers", {
    containers: labeledContainers,
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
          state: dockerStateToStatus(container.State, logger),
          status: container.State,
        },
      ];
    } else {
      logger.warn("missingMappedContainer", {
        key,
        message: `Couldn't find mapped docker container: ${key}`,
      });
    }

    return prev;
  }, []);

  return [...labeledContainers, ...mappedContainers].filter(
    (container) => container.name !== null
  );
}
