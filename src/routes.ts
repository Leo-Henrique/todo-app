import { ServerResponse } from "http";
import { Request } from "./config/http";

import { Database } from "./database";
import { buildRoutePath } from "./utils/build-route-path";

interface Route {
  method: string;
  path: RegExp;
  handler: (req: Request, res: ServerResponse) => void;
}

const database = new Database();

export const routes: Route[] = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      return res.end("GET");
    },
  },
];
