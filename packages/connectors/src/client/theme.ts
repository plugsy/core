import { CSSObject, css } from "styled-components";
import { CategoryThemeable } from "./components/Category";
import { ConnectionStatusThemable } from "./components/ConnectionStatus";
import { ItemThemable } from "./components/Item";
import { StatusBoxThemeables } from "./components/StatusBox";

type CSSThemeable<T extends string> = { [key in T]?: CSSObject | undefined };

export type ComponentThemes = {
  Category: CSSThemeable<CategoryThemeable>;
  ConnectionStatus: CSSThemeable<ConnectionStatusThemable>;
  Item: CSSThemeable<ItemThemable>;
  StatusBox: CSSThemeable<StatusBoxThemeables>;
};

import merge from "deepmerge";

export interface Theme {
  connectors: Partial<ComponentThemes>;
}

const defaultTheme: Theme = {
  components: {},
};

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
