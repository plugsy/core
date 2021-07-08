import React from "react";
import Head from "next/head";
import { createGlobalStyle } from "styled-components";

export const Fonts: React.FC = () => (
  <Head>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Assistant&family=Quicksand:wght@500&display=swap"
      rel="stylesheet"
    />
  </Head>
);

export const GlobalFontStyles = createGlobalStyle`
    p, span, div {
        font-family: 'Assistant', sans-serif;
    }

    h1, h2, h3, h4, h5 {
        font-family: 'Quicksand', sans-serif;
    }
`;
