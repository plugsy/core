import { Theme } from "./";

declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
