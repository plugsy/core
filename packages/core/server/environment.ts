export const environment = () => ({
  get port() {
    const envVar = process.env.PLUGSY_PORT;
    if (envVar) {
      try {
        return parseInt(envVar, 10);
      } catch (error) {
        console.error("[environment] Error getting port", error);
      }
    }
    return 3000;
  },
  dev: process.env.NODE_ENV !== "production",
  loggingLevel: process.env.PLUGSY_LOGGER_LEVEL ?? "info",
  localConfigFile: process.env.PLUGSY_LOCAL_CONFIG_FILE ?? "/config.json",
});

export type Environment = ReturnType<typeof environment>;
