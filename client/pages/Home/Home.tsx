import differenceInSeconds from "date-fns/differenceInSeconds/index.js";
import parseISO from "date-fns/parseISO";
import Head from "next/head";
import React, { useEffect, useMemo, useState } from "react";
import useInterval from "react-use/lib/useInterval";
import styled from "styled-components";
import { apolloClient } from "../../../lib/apollo";
import { formatDistanceToNowShort } from "../../../lib/utils/format-distance-to-now-short";
import { ContainerState } from "../../../types.graphql";
import { DockerCategory } from "../../components/DockerCategory";
import { StatusBox } from "../../components/StatusBox";
import {
  useLastUpdatedSubscription,
  useCategoriesSubscription,
  FullCategoryFragment,
  InitDocument,
  InitQuery,
  useErrorSubscription,
  useConnectedSubscription,
} from "./Home.generated.graphql";

interface Props {
  initialCategories?: FullCategoryFragment[];
  initialError?: string;
  initialLastUpdated?: string;
  initialConnected?: boolean;
}

const HomeContainer = styled.div`
  margin: auto;
  max-width: 900px;
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatusBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StatusBoxContainers = styled.div`
  display: flex;
  flex-direction: row;
  padding: 32px;

  flex-wrap: wrap;
  margin: -24px 0 0 -24px;
  width: calc(100% + 24px);
  ${StatusBoxContainer} {
    margin: 24px 0 0 24px;
  }
`;

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function statesToStatus(containerStates: ContainerState[]) {
  const statuses = containerStates.map(containerStateToStatus);
  if (statuses.some((status) => status === "RED")) return "RED";
  if (statuses.some((status) => status === "YELLOW")) return "YELLOW";
  if (statuses.every((status) => status === "GREY")) return "GREY";
  if (statuses.every((status) => status === "GREEN")) return "GREEN";
  return "GREY";
}

export function Home({
  initialCategories,
  initialError,
  initialLastUpdated,
  initialConnected,
}: Props) {
  const [lastUpdated, setLastUpdated] = useState(initialLastUpdated);
  const [_, setError] = useState<string | undefined | null>(initialError);
  const [categories, setCategories] = useState(initialCategories);
  const [connected, setConnected] = useState(initialConnected);

  const { data: categoriesData } = useCategoriesSubscription();

  useEffect(() => {
    if (categoriesData?.categories) setCategories(categoriesData.categories);
  }, [categoriesData]);

  const { data: lastUpdatedData } = useLastUpdatedSubscription();

  useEffect(() => {
    if (lastUpdatedData?.lastUpdated)
      setLastUpdated(lastUpdatedData?.lastUpdated);
  }, [lastUpdatedData]);

  const { data: errorData } = useErrorSubscription();
  useEffect(() => {
    if (errorData?.error) setError(errorData.error);
  }, [errorData]);

  const { data: connectedData } = useConnectedSubscription();
  useEffect(() => {
    if (connectedData?.connected) setConnected(connectedData.connected);
  }, [connectedData]);
  const lastUpdatedDate = lastUpdated ? parseISO(lastUpdated) : new Date();
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState<number>(0);
  useInterval(() => {
    // TODO: Sync this with server time as if there's a clock difference, this doesn't work so great
    setLastUpdatedSeconds(
      Math.max(0, differenceInSeconds(new Date(), lastUpdatedDate))
    );
  }, 1000);
  const lastUpdatedStr = useMemo(
    () => (lastUpdated ? formatDistanceToNowShort(lastUpdatedDate) : "N/A"),
    [lastUpdated, lastUpdatedData, lastUpdatedSeconds]
  );
  return (
    <>
      <Head>
        <title>Auto Docker Dash</title>
        <meta property="og:title" content="Auto Docker Dash" key="title" />
      </Head>
      <HomeContainer>
        <StatusBoxContainers>
          <StatusBoxContainer>
            <StatusBox
              title={"Docker"}
              text={connected ? "OK" : "DC'd"}
              status={connected ? "GREEN" : "RED"}
            />
          </StatusBoxContainer>
          <StatusBoxContainer>
            <StatusBox
              title={"Updated"}
              text={lastUpdatedStr}
              status={
                lastUpdatedSeconds === undefined
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

        <CategoriesContainer>
          {categories?.map((category) => (
            <DockerCategory
              key={`category-${category.name}`}
              name={category.name}
              containers={category.containers.map(
                ({ name, link, icon, state, children }) => {
                  return {
                    key: name,
                    text: name,
                    link: link ?? undefined,
                    iconPack: icon?.split("/")[0],
                    icon: icon?.split("/")[1],
                    state: toTitleCase(state),
                    status: containerStatesToStatus([
                      state,
                      ...children.map((child) => child.state),
                    ]),
                    children: children.map(({ name, icon, state }) => ({
                      key: name,
                      text: name,
                      iconPack: icon?.split("/")[0],
                      icon: icon?.split("/")[1],
                      status: containerStateToStatus(state),
                      state: toTitleCase(state),
                    })),
                  };
                }
              )}
            />
          ))}
        </CategoriesContainer>
      </HomeContainer>
    </>
  );
}

export async function getServerSideProps() {
  const { data } = await apolloClient.query<InitQuery>({
    query: InitDocument,
  });
  return {
    props: {
      initialCategories: data?.categories,
      initialError: data?.error,
      initialLastUpdated: data?.lastUpdated,
      initialConnected: data?.connected,
    } as Props,
  };
}
