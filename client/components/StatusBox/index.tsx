import React from "react";
import styled from "styled-components";

export interface StatusBoxProps {
  title: string;
  text: string;
  status: "GREEN" | "YELLOW" | "RED" | "GREY";
}

export const Title = styled.h5`
  margin: 0;
  padding: 0;
  font-size: 16px;
`;

export const Text = styled.h3`
  margin: 0;
  font-size: 28px;
  padding: 0;
`;

export const Container = styled.div`
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
`;
export const TitleContainer = styled.div``;
export const TextContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

interface StatusBarProps {
  status: StatusBoxProps["status"];
}

export const StatusBar = styled.div<StatusBarProps>`
  height: 6px;
  border-radius: 6px;
  background: ${({ status }) =>
    status === "GREEN"
      ? "green"
      : status === "YELLOW"
      ? "yellow"
      : status === "GREY"
      ? "grey"
      : "red"};
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
