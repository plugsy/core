import Head from "next/head";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { apolloClient } from "../../../lib/apollo";
import { State } from "../../../types.graphql";
import { ConnectionStatus } from "../../components/ConnectionStatus";
import { DockerCategory } from "../../components/DockerCategory";
import {
  useCategoriesSubscription,
  FullCategoryFragment,
  InitDocument,
  InitQuery,
  FullConnectionFragment,
  useConnectionsSubscription,
} from "./Home.generated.graphql";

interface Props {
  initialCategories?: FullCategoryFragment[];
  initialConnections?: FullConnectionFragment[];
}

const HomeContainer = styled.div`
  margin: auto;
  max-width: 900px;
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const Connection = styled.div``;
const ConnectionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: -18px 0 0 -18px;
  padding-left: 32px;
  padding-right: 32px;

  ${Connection} {
    margin: 18px 0 0 18px;
  }
`;

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function statesToStatus(containerStates: State[]) {
  if (containerStates.some((status) => status === "RED")) return "RED";
  if (containerStates.some((status) => status === "YELLOW")) return "YELLOW";
  if (containerStates.every((status) => status === "GREY")) return "GREY";
  if (containerStates.every((status) => status === "GREEN")) return "GREEN";
  return "GREY";
}

export function Home({ initialCategories, initialConnections }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [connections, setConnections] = useState(initialConnections);

  const { data: categoriesData } = useCategoriesSubscription();

  useEffect(() => {
    if (categoriesData?.categories) setCategories(categoriesData.categories);
  }, [categoriesData]);

  const { data: connectionsData } = useConnectionsSubscription();

  useEffect(() => {
    if (connectionsData?.connections)
      setConnections(connectionsData.connections);
  }, [connectionsData]);

  return (
    <>
      <Head>
        <title>Auto Docker Dash</title>
        <meta property="og:title" content="Auto Docker Dash" key="title" />
      </Head>
      <HomeContainer>
        <CategoriesContainer>
          {categories?.map((category) => (
            <DockerCategory
              key={`category-${category.name}`}
              name={category.name}
              containers={category.items.map(
                ({ name, link, icon, state, children, status }) => {
                  return {
                    key: name,
                    text: name,
                    link: link ?? undefined,
                    iconPack: icon?.split("/")[0],
                    icon: icon?.split("/")[1],
                    state: statesToStatus([
                      state,
                      ...children.map((child) => child.state),
                    ]),
                    status: status ? toTitleCase(status) : undefined,
                    children: children.map(({ name, icon, state, status }) => ({
                      key: name,
                      text: name,
                      status: status ? toTitleCase(status) : undefined,
                      iconPack: icon?.split("/")[0],
                      icon: icon?.split("/")[1],
                      state: statesToStatus([state]),
                    })),
                  };
                }
              )}
            />
          ))}
        </CategoriesContainer>
        <ConnectionsContainer>
          {connections?.map((props) => {
            return (
              <Connection key={`connection-${props.id}`}>
                <ConnectionStatus {...props} />
              </Connection>
            );
          })}
        </ConnectionsContainer>
      </HomeContainer>
    </>
  );
}

export async function getServerSideProps() {
  const { data, error } = await apolloClient.query<InitQuery>({
    query: InitDocument,
    fetchPolicy: "no-cache",
  });
  if (error) {
    console.log(error);
  }
  return {
    props: {
      initialCategories: data?.categories ?? [],
      initialConnections: data?.connections ?? [],
    } as Props,
  };
}
