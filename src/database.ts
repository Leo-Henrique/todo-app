import fs from "fs/promises";
import { join } from "path";

const databasePath = join(__dirname, "../database.json");

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath)
      .then(data => (this.#database = JSON.parse(data.toString())))
      .catch(() => this.#persist());
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }
}
