import React from "react";
import styled from "styled-components";
import { getColor, getComponentTheme } from "../../theme";

export type StatusBoxThemeables =
  | "Title"
  | "Text"
  | "Container"
  | "TitleContainer"
  | "TextContainer"
  | "StatusBar";

const getStatusBoxTheme = (component: StatusBoxThemeables) =>
  getComponentTheme("StatusBox", component);

export interface StatusBoxProps {
  title: string;
  text: string;
  status: "GREEN" | "YELLOW" | "RED" | "GREY";
}

const Title = styled.h5`
  margin: 0;
  padding: 0;
  font-size: 16px;

  ${getStatusBoxTheme("Title")}
`;

const Text = styled.h3`
  margin: 0;
  font-size: 28px;
  padding: 0;

  ${getStatusBoxTheme("Text")}
`;

const Container = styled.div`
  width: 100px;
  height: 100px;
  display: flex;
  position: relative;
  flex-direction: column;
  text-decoration: none;
  padding: 6px;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 7px 7px 15px #d9d9d9, -7px -7px 15px #ffffff;

  ${getStatusBoxTheme("Container")}
`;
const TitleContainer = styled.div`
  ${getStatusBoxTheme("TitleContainer")}
`;
const TextContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;

  ${getStatusBoxTheme("TextContainer")}
`;

interface StatusBarProps {
  status: StatusBoxProps["status"];
}

const StatusBar = styled.div<StatusBarProps>`
  height: 6px;
  border-radius: 6px;
  background: ${({ status }) => getColor(status)};

  ${getStatusBoxTheme("StatusBar")}
`;

export const StatusBox: React.FC<StatusBoxProps> = ({
  title,
  text,
  status,
}) => {
  return (
    <Container>
      <TitleContainer>
        <Title as="h1">{title}</Title>
      </TitleContainer>
      <TextContainer>
        <Text as="h2">{text}</Text>
      </TextContainer>
      <StatusBar status={status} />
    </Container>
  );
};
