import { Request, Response } from "./config/http";

import { Database } from "./database";
import { Task } from "./models/task";
import { buildRoutePath } from "./utils/build-route-path";

interface Route {
  method: string;
  path: RegExp;
  handler: (req: Request, res: Response) => void;
}

const database = new Database<["tasks"]>(["tasks"]);

export const routes: Route[] = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      if (!req.body) return res.badRequest("No data provided");

      const insertedTask = database.insert<Task>("tasks", {
        ...req.body,
        completed_at: null,
      });

      res.ok(insertedTask, 201);
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const tasks = database.select<Task>("tasks", null, {
        query: search,
        fields: ["title", "description"],
      });

      res.ok(tasks);
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.select<Task>("tasks", id);

      if (!task) return res.badRequest("Task not found");

      if (!req.body) return res.badRequest("No data provided");

      database.update<Task>("tasks", id, req.body);

      res.ok(null, 204);
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.select<Task>("tasks", id);

      if (!task) return res.badRequest("Task not found");

      database.update<Task>("tasks", id, {
        completed_at: task.completed_at ? null : new Date(),
      });

      res.ok(null, 204);
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.select<Task>("tasks", id);

      if (!task) return res.badRequest("Task not found");

      database.delete<Task>("tasks", id);

      res.ok(null, 204);
    },
  },
];
