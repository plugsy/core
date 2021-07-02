import { CSSObject } from "styled-components";
import { HomeThemeable } from "./Home";

type CSSThemeable<T extends string> = { [key in T]?: CSSObject | undefined };

export type PageThemes = {
  Home: CSSThemeable<HomeThemeable>;
};
