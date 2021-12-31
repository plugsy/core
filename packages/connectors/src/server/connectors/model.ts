import { ConnectorType } from ".";

export interface Item {
  name: string;
  connectorType: ConnectorType;
  category: string | null;
  icon: string | null;
  link: string | null;
  state: "RED" | "GREEN" | "YELLOW" | "GREY";
  status: string | null;
  parents: string[];
}

export interface ConnectionData {
  id: string;
  connected: boolean;
  lastUpdated: Date | null;
  items: Item[];
  error: string | null;
}
