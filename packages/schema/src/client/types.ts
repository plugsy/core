import { ApolloClient } from "@apollo/client";
import type {
  PreviewData,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import type { ParsedUrlQuery } from "querystring";

export type GetServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = (
  client: ApolloClient<any>,
  context: GetServerSidePropsContext<Q, D>
) => Promise<GetServerSidePropsResult<P>>;

export type PlugsyComponent<
  P extends { [key: string]: any } = { [key: string]: any }
> = React.ComponentType<P> & {
  getServerSideProps?: GetServerSideProps<P>;
};

export type PlugsyComponentMap = Record<string, PlugsyComponent>;
