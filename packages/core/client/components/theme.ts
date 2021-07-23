import { CSSObject } from "styled-components";
import { CategoryThemeable } from "./Category";
import { ConnectionStatusThemable } from "./ConnectionStatus";
import { ItemThemable } from "./Item";
import { StatusBoxThemeables } from "./StatusBox";

type CSSThemeable<T extends string> = { [key in T]?: CSSObject | undefined };

export type ComponentThemes = {
  Category: CSSThemeable<CategoryThemeable>;
  ConnectionStatus: CSSThemeable<ConnectionStatusThemable>;
  Item: CSSThemeable<ItemThemable>;
  StatusBox: CSSThemeable<StatusBoxThemeables>;
};
