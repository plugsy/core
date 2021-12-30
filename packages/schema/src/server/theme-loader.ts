import { distinctUntilChanged, map, Observable } from "rxjs";
import { Logger } from "winston";
import { calculateShadesAndTints } from "../lib/colors";
import { ColorShades as GQLColorShades } from "./schema";
import { ColorNames, PaletteConfig, ThemeConfig } from "./types";

type ValidColorShades = keyof Omit<GQLColorShades, "__typename">;
type ColorShades = Record<ValidColorShades, String>;
type FullPalette = {
  [key in ColorNames]: ColorShades;
};

const defaultPalette: { [key in ColorNames]: string } = {
  background: "#FFFFFF",
  foreground: "#000000",
  primary: "#020887",
  secondary: "#006D77",
  error: "#D80032",
  success: "#3E8914",
  warning: "#F1D302",
  neutral: "#938BA1",
};

const getPalette = (config: Partial<PaletteConfig>): FullPalette => {
  return Object.entries(defaultPalette).reduce((palette, [key, value]) => {
    let colorName = key as keyof FullPalette;
    return {
      ...palette,
      [colorName]: calculateShadesAndTints(config[colorName] ?? value),
    };
  }, {} as FullPalette);
};

export interface FullTheme {
  palette: FullPalette;
}

export const themeLoader$ = (
  logger: Logger,
  themeConfig$: Observable<ThemeConfig>
): Observable<FullTheme> => {
  return themeConfig$.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    map((config): FullTheme => {
      const configPalette = config?.palette ?? {};
      const palette = getPalette(configPalette);
      logger.silly("Generated new palette", {
        config: configPalette,
        palette,
      });
      return {
        ...config,
        palette,
      };
    })
  );
};
