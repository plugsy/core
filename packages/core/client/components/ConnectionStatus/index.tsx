import differenceInSeconds from "date-fns/differenceInSeconds";
import React, { useState } from "react";
import { useHarmonicIntervalFn } from "react-use";
import styled from "styled-components";
import { formatDistanceToNowShort } from "../../../lib/utils/format-distance-to-now-short";
import { StatusBox } from "../StatusBox";
import { getComponentTheme } from "../../theme";

export type ConnectionStatusThemable =
  | "StatusBoxContainer"
  | "StatusBoxContainers"
  | "ConnectionStatusContainer"
  | "ConnectionStatusId";

const getConnectionStatusTheme = (component: ConnectionStatusThemable) =>
  getComponentTheme("ConnectionStatus", component);

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export interface ConnectionStatusProps {
  id: string;
  connected: boolean;
  lastUpdated?: Date;
}

const StatusBoxContainer = styled.div`
  display: flex;
  flex-direction: row;

  ${getConnectionStatusTheme("StatusBoxContainer")}
`;

const StatusBoxContainers = styled.div`
  display: flex;
  flex-direction: row;

  flex-wrap: wrap;
  margin: -12px 0 0 -12px;
  width: calc(100% + 12px);
  ${StatusBoxContainer} {
    margin: 12px 0 0 12px;
  }

  ${getConnectionStatusTheme("StatusBoxContainers")}
`;
const ConnectionStatusContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${getConnectionStatusTheme("ConnectionStatusContainer")}
`;

const ConnectionStatusId = styled.div`
  margin-top: 24px;
  margin-bottom: 12px;

  ${getConnectionStatusTheme("ConnectionStatusId")}
`;

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  lastUpdated,
  id,
  connected,
}) => {
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(0);
  const [lastUpdatedStr, setLastUpdatedStr] = useState(
    lastUpdated ? formatDistanceToNowShort(lastUpdated) : undefined
  );
  useHarmonicIntervalFn(() => {
    if (lastUpdated) {
      setLastUpdatedSeconds(
        Math.max(0, differenceInSeconds(new Date(), lastUpdated))
      );
      setLastUpdatedStr(formatDistanceToNowShort(lastUpdated));
    }
  }, 1000);
  return (
    <ConnectionStatusContainer>
      <ConnectionStatusId>{toTitleCase(id)}</ConnectionStatusId>
      <StatusBoxContainers>
        <StatusBoxContainer>
          <StatusBox
            title={"Status"}
            text={connected ? "OK" : "DC'd"}
            status={connected ? "GREEN" : "RED"}
          />
        </StatusBoxContainer>
        {lastUpdatedStr ? (
          <StatusBoxContainer>
            <StatusBox
              title={"Updated"}
              text={lastUpdatedStr}
              status={
                lastUpdatedSeconds > 60
                  ? "YELLOW"
                  : lastUpdatedSeconds > 300
                  ? "RED"
                  : "GREEN"
              }
            />
          </StatusBoxContainer>
        ) : null}
      </StatusBoxContainers>
    </ConnectionStatusContainer>
  );
};
