export const environment = () => ({
  loggingLevel: process.env.DOCKER_DASH_LOGGER_LEVEL ?? "info",
  localConfigFile: process.env.DOCKER_DASH_LOCAL_CONFIG_FILE ?? "/config.json",
});

export type Environment = ReturnType<typeof environment>;
