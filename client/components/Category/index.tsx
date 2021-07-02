import React from "react";
import styled from "styled-components";
import { Item, ItemProps } from "../Item";
import { getComponentTheme } from "../../theme";

export type CategoryThemeable = "Title" | "Container" | "Containers";

const getCategoryTheme = (component: CategoryThemeable) =>
  getComponentTheme("Category", component);

export interface CategoryTheme {
  Title: string;
  Icon: string;
  Text: string;
  Container: string;
  Containers: string;
}

export interface CategoryProps {
  name: string;
  containers: ItemProps[];
}

const Title = styled.h2`
  ${getCategoryTheme("Title")}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 32px;
  margin-right: 32px;

  ${getCategoryTheme("Container")}
`;

const Containers = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  margin: -24px 0 0 -24px;
  width: calc(100% + 24px);
  ${Container} {
    margin: 24px 0 0 24px;
  }

  ${getCategoryTheme("Containers")}
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
