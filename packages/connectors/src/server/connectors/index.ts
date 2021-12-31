import { dockerConnection, DockerConnectionConfig } from "./docker";
import { DOCKER_CONNECTOR_TYPE } from "./docker/docker-dash-observables";
import { rawConnection, RawConnectionConfig, RAW_CONNECTOR_TYPE } from "./raw";
import {
  WEBSITE_CONNECTOR_TYPE,
  websiteConnection,
  WebsiteConnectionConfig,
} from "./website";

import { Logger } from "winston";

export type ConnectorType =
  | DOCKER_CONNECTOR_TYPE
  | RAW_CONNECTOR_TYPE
  | WEBSITE_CONNECTOR_TYPE;

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

export function getConnector(connector: ConnectorConfig, logger: Logger) {
  switch (connector.type) {
    case "DOCKER":
      return dockerConnection(connector.config, logger);
    case "RAW":
      return rawConnection(connector.config, logger);
    case "WEBSITE":
      return websiteConnection(connector.config, logger);
  }
}

export * from "./model";
