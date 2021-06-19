import React from "react";
import styled from "styled-components";
import { Item, ItemProps } from "../Item";

export interface CategoryProps {
  name: string;
  containers: ItemProps[];
}


export const Title = styled.h2``;

export const Icon = styled.div``;

export const Text = styled.p``;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 32px;
  margin-right: 32px;
`;

export const Containers = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  margin: -24px 0 0 -24px;
  width: calc(100% + 24px);
  ${Container} {
    margin: 24px 0 0 24px;
  }
`;


export const Category: React.FC<CategoryProps> = ({ name, containers }) => {
  return (
    <Container>
      <Title>{name}</Title>
      <Containers>
        {containers.map((containerProps) => (
          <Container key={`${name}-${containerProps.text}`}>
            <Item {...containerProps} />
          </Container>
        ))}
      </Containers>
    </Container>
  );
};
