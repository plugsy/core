import { css, CSSObject } from "styled-components";
import { ComponentThemes } from "./components/theme";
import { PageThemes } from "./pages/theme";
import merge from "deepmerge";

export interface Theme {
  colors: {
    GREEN: string;
    YELLOW: string;
    RED: string;
    GREY: string;
  };
  components: Partial<ComponentThemes>;
  pages: Partial<PageThemes>;
}

export interface ThemeConfig extends Partial<Omit<Theme, "colors">> {
  colors?: Partial<Theme["colors"]>;
}

const defaultTheme: Theme = {
  colors: {
    GREEN: "green",
    GREY: "grey",
    RED: "red",
    YELLOW: "yellow",
  },
  components: {},
  pages: {},
};

export function getTheme(theme: ThemeConfig): Theme {
  return merge(defaultTheme, theme) as Theme;
}

export function getColor(color: keyof Theme["colors"]) {
  return ({ theme }: { theme: Theme }) => theme.colors[color];
}

export function getComponentTheme<
  P extends keyof ComponentThemes,
  T extends keyof ComponentThemes[P]
>(parent: P, component: T) {
  return ({ theme }: { theme: Theme }) => {
    const obj = theme.components?.[parent] as
      | { [str in T]: CSSObject | undefined }
      | undefined;
    const child = obj?.[component];
    return css(child ?? {});
  };
}

export function getPageTheme<
  P extends keyof PageThemes,
  T extends keyof PageThemes[P]
>(parent: P, component: T) {
  return ({ theme }: { theme: Theme }) => {
    const obj = theme.pages?.[parent] as
      | { [str in T]: CSSObject | undefined }
      | undefined;
    const child = obj?.[component];
    return css(child ?? {});
  };
}
