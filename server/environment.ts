export const environment = () => ({
  nameLabel: process.env.DOCKER_DASH_NAME_LABEL ?? "dockerDash.name",
  categoryLabel:
    process.env.DOCKER_DASH_CATEGORY_LABEL ?? "dockerDash.category",
  iconLabel: process.env.DOCKER_DASH_ICON_LABEL ?? "dockerDash.icon",
  linkLabel: process.env.DOCKER_DASH_LINK_LABEL ?? "dockerDash.link",
  parentsLabel: process.env.DOCKER_DASH_PARENTS_LABEL ?? "dockerDash.parents",
  dockerSocket: process.env.DOCKER_SOCKET ?? "/var/run/docker.sock",
  dockerHost: process.env.DOCKER_HOST,
  dockerPort: process.env.DOCKER_PORT,
  dockerProtocol: process.env.DOCKER_PROTOCOL as
    | "https"
    | "http"
    | "ssh"
    | undefined,
  dockerVersion: process.env.DOCKER_VERSION,
  fileStoragePath: process.env.DOCKER_DASH_FILE_STORAGE_PATH,
});

export type Environment = ReturnType<typeof environment>;

