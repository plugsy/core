import { BehaviorSubject } from "rxjs";
import { Connection, Item } from "../model";

export interface RawConnectionConfig {
  id?: string;
  items: Item[];
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
        return ({
          category: category ?? null,
          icon: icon ?? null,
          name: name ?? null,
          link: link ?? null,
          parents: parents ?? [],
          state: state ?? null,
          status: status ?? null,
        })
      }
    ),
    lastUpdated: null,
  });
};
