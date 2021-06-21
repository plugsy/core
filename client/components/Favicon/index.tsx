import Head from "next/head";

export interface FaviconProps {
  state?: "RED" | "GREEN";
}

export const Favicon: React.FC<FaviconProps> = ({ state = "GREEN" }) => {
  return (
    <Head>
      <link
        rel="icon"
        type="image/svg+xml"
        href={state === "GREEN" ? '/favicon-success.svg' : '/favicon-error.svg'}
      />
      <link
        rel="mask-icon"
        type="image/svg+xml"
        href={state === "GREEN" ? '/favicon-success.svg' : '/favicon-error.svg'}
      />
      <link rel="alternate icon" href={'/favicon.ico'}/>
    </Head>
  );
};
