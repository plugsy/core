import { dockerConnection, DockerConnectionConfig } from "./docker";
import { DOCKER_CONNECTOR_TYPE } from "./docker/docker-dash-observables";
import { rawConnection, RawConnectionConfig, RAW_CONNECTOR_TYPE } from "./raw";
import {
  WEBSITE_CONNECTOR_TYPE,
  websiteConnection,
  WebsiteConnectionConfig,
} from "./website";

type DockerconnectorConfig = {
  type: DOCKER_CONNECTOR_TYPE;
  config: DockerConnectionConfig;
};

type RawConnectorConfig = {
  type: RAW_CONNECTOR_TYPE;
  config: RawConnectionConfig;
};

type WebsiteConnectorConfig = {
  type: WEBSITE_CONNECTOR_TYPE;
  config: WebsiteConnectionConfig;
};

export type ConnectorConfig =
  | DockerconnectorConfig
  | RawConnectorConfig
  | WebsiteConnectorConfig;

export function getConnector(connector: ConnectorConfig) {
  switch (connector.type) {
    case "docker":
      return dockerConnection(connector.config);
    case "raw":
      return rawConnection(connector.config);
    case "website":
      return websiteConnection(connector.config);
  }
}
