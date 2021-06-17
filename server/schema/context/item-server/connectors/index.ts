import { dockerConnection, DockerConnectionConfig } from "./docker";
import { rawConnection, RawConnectionConfig } from "./raw";

type DockerconnectorConfig = {
  type: "docker";
  config: DockerConnectionConfig;
};

type RawConnectorConfig = {
  type: "raw";
  config: RawConnectionConfig;
};

export type ConnectorConfig = DockerconnectorConfig | RawConnectorConfig;

export function getConnector(connector: ConnectorConfig) {
  switch (connector.type) {
    case "docker":
      return dockerConnection(connector.config);
    case "raw":
      return rawConnection(connector.config);
  }
}

