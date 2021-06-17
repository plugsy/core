export const environment = () => ({
  localConfigFile:
    process.env.DOCKER_DASH_LOCAL_CONFIG_FILE ??
    process.env.NODE_ENV === "production"
      ? "/config.json"
      : "./config.json",
});

export type Environment = ReturnType<typeof environment>;
