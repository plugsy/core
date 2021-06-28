import { ApolloProvider } from "@apollo/client";
import App, { AppProps, AppContext } from "next/app";
import { createApolloClient } from "../lib/apollo";
import { ThemeProvider } from "styled-components";
import { NormalizeCSS } from "../client/styles/normalize-css";
import React, { useMemo } from "react";
import { Fonts, GlobalFontStyles } from "../client/styles/fonts";
import { createIsomorphLink } from "../lib/apollo/links";
import absoluteUrl from "next-absolute-url";
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
      <ThemeProvider theme={{}}>
        <ApolloProvider client={apolloClient}>
          <opts.Component {...opts.pageProps} />
        </ApolloProvider>
      </ThemeProvider>
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
