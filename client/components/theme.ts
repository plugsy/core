import { css } from "styled-components";
import { CSSObject, StyledComponent } from "styled-components";
import { CategoryThemeable } from "./Category";
import { ConnectionStatusThemable } from "./ConnectionStatus";
import { ItemThemable } from "./Item";
import { StatusBoxThemeables } from "./StatusBox";

type CSSThemeable<T extends string> = { [key in T]: CSSObject };

export interface ComponentThemes {
  Category?: CSSThemeable<CategoryThemeable>;
  ConnectionStatus?: CSSThemeable<ConnectionStatusThemable>;
  Item?: CSSThemeable<ItemThemable>;
  StatusBox?: CSSThemeable<StatusBoxThemeables>;
}

export interface Theme {
  components: ComponentThemes;
}

export function getTheme<
  P extends keyof ComponentThemes,
  T extends  ComponentThemes[P]
>(parent: P, component: T) {
  return ({ theme }: { theme: any }) =>
    css(theme.components?.[parent]?.[component] ?? {});
}

getTheme('ConnectionStatus', '')