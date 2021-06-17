import { BehaviorSubject } from "rxjs";
import { Connection, Item } from "../model";

export interface RawConnectionConfig {
  id: string;
  items: Item[];
}

export const rawConnection = ({
  id,
  items,
}: RawConnectionConfig): Connection => {
  return new BehaviorSubject({
    connected: true,
    id,
    error: null,
    items,
    lastUpdated: null,
  });
};
