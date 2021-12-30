import { IResolvers } from "apollo-server-express";
import { GraphQLSchema } from "graphql";
import { Observable } from "rxjs";
import { Logger } from "winston";
import { FullTheme } from "./theme-loader";
import { Palette as GQLPalette } from "./schema";

type OptionalArgTuple<T> = T extends undefined ? [] : [Observable<T>];

export type InitialisedPluginMap = Record<
  string,
  {
    type: string;
    plugin: ServerPlugin;
    schema: GraphQLSchema;
  }
>;

export type PluginMap = { [key: string]: ServerPluginFn };

export interface ServerPlugin<Ctx = any> {
  schemaPaths: string[];
  resolvers: IResolvers;
  getContext?: (logger: Logger) => Ctx;
  onTeardown?: () => void;
}

export type ServerPluginFn<Cfg = any, Ctx = any> = (
  logger: Logger,
  id: string,
  ...params: OptionalArgTuple<Cfg>
) => Promise<ServerPlugin<Ctx>>;

export interface PluginConfig<T extends string, C> {
  id?: string;
  type: T;
  config: C;
}

export interface ComponentConfig {
  name: string;
  props: object;
}

export type ColorNames = keyof Omit<GQLPalette, "__typename">;

export type PaletteConfig = Partial<{ [key in ColorNames]: string }>;
export type ThemeConfig =
  | {
      palette: PaletteConfig;
    }
  | undefined
  | null;

export interface PlugsyConfig {
  components: ComponentConfig[];
  plugins: PluginConfig<any, any>[];
  theme?: ThemeConfig;
}

export interface PlugsyContext {
  reload: () => void;
  components$: Observable<ComponentConfig[]>;
  plugins$: Observable<InitialisedPluginMap>;
  theme$: Observable<FullTheme>;
  logger: Logger;
}
