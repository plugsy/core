import { Observable } from "rxjs";
import { Logger } from "winston";
import { IResolvers } from "apollo-server-express";
import path from "path";

type OptionalArgTuple<T> = T extends undefined ? [] : [Observable<T>];

export interface Plugin<Ctx = any> {
  resolvers?: IResolvers;
  schemaPaths?: string[];
  getContext?: () => Ctx;
  onTeardown?: () => void;
}

export type PluginFn<Cfg = any, Ctx = any> = (
  logger: Logger,
  ...params: OptionalArgTuple<Cfg>
) => Promise<Plugin<Ctx>>;

export const CorePlugin: PluginFn<undefined> = async () => ({
  schemaPaths: [path.join(__dirname, "schema/index.core.graphql")],
});
