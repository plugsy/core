import differenceInSeconds from "date-fns/differenceInSeconds";
import parseISO from "date-fns/parseISO";
import React from "react";
import styled from "styled-components";
import { formatDistanceToNowShort } from "../../../lib/utils/format-distance-to-now-short";
import { StatusBox } from "../StatusBox";

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export interface ConnectionStatusProps {
  id: string;
  connected: boolean;
  lastUpdated?: string;
}

const StatusBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
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
`;
const ConnectionStatusContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ConnectionStatusId = styled.div`
  margin-top: 24px;
  margin-bottom: 12px;
`;

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  lastUpdated,
  id,
  connected,
}) => {
  const lastUpdatedDate = lastUpdated ? parseISO(lastUpdated) : new Date();
  const lastUpdatedSeconds = Math.max(
    0,
    differenceInSeconds(new Date(), lastUpdatedDate)
  );
  const lastUpdatedStr = lastUpdated
    ? formatDistanceToNowShort(lastUpdatedDate)
    : "N/A";
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
          <StatusBoxContainer>
            <StatusBox
              title={"Updated"}
              text={lastUpdatedStr}
              status={
                lastUpdated === undefined
                  ? "GREY"
                  : lastUpdatedSeconds > 60
                  ? "YELLOW"
                  : lastUpdatedSeconds > 300
                  ? "RED"
                  : "GREEN"
              }
            />
          </StatusBoxContainer>
        </StatusBoxContainers>
      </ConnectionStatusContainer>
  );
};
