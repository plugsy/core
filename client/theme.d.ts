import type { LooseTheme } from "./components/theme";

declare module "styled-components" {
  export interface DefaultTheme extends LooseTheme {}
}
