import { BehaviorSubject, Observable } from "rxjs";
import { ConnectionData } from "../model";
import { Logger } from "winston";

const CONNECTOR_TYPE = "RAW";
export type RAW_CONNECTOR_TYPE = typeof CONNECTOR_TYPE;

export interface RawConnectionConfig {
  id?: string;
  items: {
    name: string;
    category?: string | null;
    icon?: string | null;
    link?: string | null;
    state?: "RED" | "GREEN" | "YELLOW" | "GREY";
    status?: string | null;
    parents?: string[];
  }[];
}

export const rawConnection = (
  { id = "raw", items }: RawConnectionConfig,
  logger: Logger
): Observable<ConnectionData> => {
  logger.child({ component: "rawConnection", id }).verbose("init", { id });
  return new BehaviorSubject({
    connected: true,
    id,
    error: null,
    items: items.map(
      ({ category, icon, name, link, parents, state, status }) => {
        return {
          connectorType: CONNECTOR_TYPE,
          category: category ?? null,
          icon: icon ?? null,
          name: name ?? null,
          link: link ?? null,
          parents: parents ?? [],
          state: state ?? "GREY",
          status: status ?? null,
        };
      }
    ),
    lastUpdated: null,
  });
};
