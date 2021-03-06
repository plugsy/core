import { ApolloProvider } from "@apollo/client";
import App, { AppProps, AppContext } from "next/app";
import { createApolloClient } from "../lib/apollo";
import { NormalizeCSS } from "../client/styles/normalize-css";
import React, { useMemo } from "react";
import { Fonts, GlobalFontStyles } from "../client/styles/fonts";
import { createIsomorphLink } from "../lib/apollo/links";
import { getOrigin } from "../lib/get-origin";

interface MyAppProps extends AppProps {
  origin: string;
}
function MyApp(opts: MyAppProps) {
  const apolloClient = useMemo(() => {
    return createApolloClient({
      ssrMode: typeof window === "undefined",
      links: [createIsomorphLink(opts.origin)],
    });
  }, [opts.origin]);
  return (
    <>
      <NormalizeCSS />
      <GlobalFontStyles />
      <Fonts />
      <ApolloProvider client={apolloClient}>
        <opts.Component {...opts.pageProps} />
      </ApolloProvider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const req = appContext.ctx.req;
  const appProps = await App.getInitialProps(appContext);
  const origin = getOrigin(req);
  return {
    ...appProps,
    origin,
  };
};

export default MyApp;
