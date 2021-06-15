import React from "react";
import styled from "styled-components";
import { DockerTag, DockerTagProps } from "../DockerTag";

export interface DockerCategoryProps {
  name: string;
  containers: DockerTagProps[];
}

export const DockerContainer = styled.div``;

export const Title = styled.h2``;

export const Icon = styled.div``;

export const Text = styled.p``;

export const DockerContainers = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  margin: -24px 0 0 -24px;
  width: calc(100% + 24px);
  ${DockerContainer} {
    margin: 24px 0 0 24px;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 32px;
  margin-right: 32px;
`;


export const DockerCategory: React.FC<DockerCategoryProps> = ({
  name,
  containers,
}) => {
  return (
    <Container>
      <Title>{name}</Title>
      <DockerContainers>
        {containers.map((containerProps) => (
            <DockerContainer key={`${name}-${containerProps.text}`}>
              <DockerTag {...containerProps} />
            </DockerContainer>
        ))}
      </DockerContainers>
    </Container>
  );
};
