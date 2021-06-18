import { BehaviorSubject } from "rxjs";
import { Connection, Item } from "../model";

const CONNECTOR_TYPE = "raw";
export type RAW_CONNECTOR_TYPE = typeof CONNECTOR_TYPE;

export interface RawConnectionConfig {
  id?: string;
  items: Omit<Item, "connectorType">[];
}

export const rawConnection = ({
  id = "raw",
  items,
}: RawConnectionConfig): Connection => {
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
          state: state ?? null,
          status: status ?? null,
        };
      }
    ),
    lastUpdated: null,
  });
};
