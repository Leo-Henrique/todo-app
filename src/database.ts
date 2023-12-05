import { randomUUID } from "crypto";
import fs from "fs/promises";
import { join } from "path";
import { Table } from "./models";

const databasePath = join(__dirname, "../database.json");

type Search<T> = {
  query: string;
  fields: (keyof T)[];
};

export class Database<Tables extends string[]> {
  tables: Tables;
  private database = {} as Record<Tables[number], any[]>;

  constructor(tables: Tables) {
    this.tables = tables;

    fs.readFile(databasePath)
      .then(data => {
        this.database = JSON.parse(data.toString());
      })
      .catch(() => {
        this.database = tables.reduce((db, key) => {
          db[key as keyof typeof db] = [];

          return db;
        }, {} as Record<Tables[number], []>);

        this.save();
      });
  }

  private save() {
    fs.writeFile(databasePath, JSON.stringify(this.database));
  }

  insert<T>(
    table: Tables[number],
    data: Omit<T, "id" | "updated_at" | "created_at">,
    options: {
      id?: boolean;
      updated_at?: boolean;
      created_at?: boolean;
    } = {}
  ) {
    const { id, created_at, updated_at } = {
      id: true,
      created_at: true,
      updated_at: true,
      ...options,
    };
    const processedData = data as typeof data & Table;

    if (id) processedData.id = randomUUID();
    if (created_at) processedData.created_at = new Date();
    if (updated_at) processedData.updated_at = new Date();

    this.database[table].push(processedData);
    this.save();

    return processedData as T;
  }

  select<T>(table: Tables[number]): T[];
  select<T>(table: Tables[number], id: string): T | undefined;
  select<T>(table: Tables[number], id: string, search: Search<T>): T | undefined;
  select<T>(table: Tables[number], id: null, search: Search<T>): T[];
  select<T>(
    table: Tables[number],
    id: string | null = null,
    search?: Search<T>
  ) {
    if (id) return this.database[table].find(item => item.id === id);

    if (search?.query) {
      return this.database[table].filter(item => {
        const keys = Object.keys(item).filter(key => {
          return search.fields.includes(key as keyof T);
        });

        return keys.some(key => {
          return item[key].toLowerCase().includes(search.query.toLowerCase());
        });
      });
    }

    return this.database[table];
  }

  update<T>(table: Tables[number], id: string, data: Partial<T>) {
    const itemIndex = this.database[table].findIndex(item => item.id === id);

    if (itemIndex > -1) {
      this.database[table][itemIndex] = {
        ...this.database[table][itemIndex],
        ...data,
      };
      this.save();

      return this.database[table] as T;
    }

    return null;
  }

  delete<T>(table: Tables[number], id: string) {
    const itemIndex = this.database[table].findIndex(item => item.id === id);

    if (itemIndex > -1) {
      this.database[table].splice(itemIndex, 1);
      this.save();

      return this.database[table] as T;
    }

    return null;
  }
}
