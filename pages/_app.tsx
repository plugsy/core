import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { apolloClient } from "../lib/apollo";
import { ThemeProvider } from "styled-components";
import { NormalizeCSS } from "../client/styles/normalize-css";
import React from "react";
import { Fonts, GlobalFontStyles } from "../client/styles/fonts";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NormalizeCSS />
      <GlobalFontStyles />
      <Fonts />
      <ThemeProvider theme={{}}>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
