export const environment = () => ({
  loggingLevel: process.env.PLUGSY_LOGGER_LEVEL ?? "info",
  localConfigFile: process.env.PLUGSY_LOCAL_CONFIG_FILE ?? "/config.json",
});

export type Environment = ReturnType<typeof environment>;
