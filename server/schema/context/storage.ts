import { readFile as _readFile, writeFile as _writeFile } from "fs";
import { promisify } from "util";
import { parseISO, formatISO } from "date-fns";
const readFile = promisify(_readFile);
const writeFile = promisify(_writeFile);

export interface Storage<T> {
  save: (containers: T[]) => Promise<void>;
  get: () => Promise<{ lastUpdated: Date; data: T[] }>;
}

export interface FileStorageConfig {
  path: string;
}

export const nullStorage: Storage<any> = {
  save: async () => {},
  get: async () => ({
    lastUpdated: new Date(),
    data: [],
  }),
};

export const fileStorage = <T extends any>({
  path,
}: FileStorageConfig): Storage<T> => {
  return {
    save: async (containers) => {
      await writeFile(
        path,
        JSON.stringify({
          lastUpdated: formatISO(new Date()),
          data: containers,
        })
      );
    },
    get: async () => {
      const file = await readFile(path);
      const json = JSON.parse(file.toString("utf-8"));
      if (!Array.isArray(json?.data))
        throw new Error("Invalid json returned from file"); // TODO: Clean this up and do proper validation
      return {
        lastUpdated: parseISO(json.date),
        data: json.data,
      };
    },
  };
};
