export const environment = () => ({
  loggingLevel: process.env.PLUGSY_LOGGER_LEVEL ?? "info",
  localConfigFile: process.env.PLUGSY_LOCAL_CONFIG_FILE ?? "/config.json",
  agentEndpoint: process.env.PLUGSY_AGENT_ENDPOINT
});

export type Environment = ReturnType<typeof environment>;
