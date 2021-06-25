import Head from "next/head";

export interface FaviconProps {
  state?: "RED" | "GREEN";
}

export const Favicon: React.FC<FaviconProps> = ({ state = "GREEN" }) => {
  const href =
    state === "GREEN" ? "/favicon-success.svg" : "/favicon-error.svg";
  return (
    <Head>
      <link rel="icon" type="image/svg+xml" href={href} />
      <link rel="mask-icon" type="image/svg+xml" href={href} />
      <link rel="alternate icon" href={"/favicon.ico"} />
    </Head>
  );
};
