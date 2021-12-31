import { ThemeProvider as StyledComponentsThemeProvider } from "styled-components";
import type { PlugsyComponent } from "../../types";
import {
  ThemeDocument,
  ThemeQuery,
  useSubscribeThemeSubscription,
  Theme,
} from "./theme.generated.graphql";

export interface ThemeProviderProps {
  theme: Omit<Theme, "__typename">;
}

export const ThemeProvider: PlugsyComponent<ThemeProviderProps> = ({
  theme,
  children,
}) => {
  const { data } = useSubscribeThemeSubscription();
  return (
    <StyledComponentsThemeProvider theme={theme ?? data?.theme}>
      {children}
    </StyledComponentsThemeProvider>
  );
};

ThemeProvider.getServerSideProps = async (apolloClient) => {
  const { data } = await apolloClient.query<ThemeQuery>({
    query: ThemeDocument,
  });

  return {
    props: {
      theme: data.theme,
    },
  };
};
