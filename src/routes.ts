import { Request, Response } from "./config/http";

import busboy from "busboy";
import { parse } from "csv-parse";
import { Database } from "./database";
import { Task } from "./models/task";
import { buildRoutePath } from "./utils/build-route-path";
import { Schema } from "./utils/validate";

interface Route {
  method: string;
  path: RegExp;
  validation?: Schema;
  handler: (req: Request, res: Response) => void;
}

const database = new Database<["tasks"]>(["tasks"]);

export const routes: Route[] = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    validation: {
      title: ["string", "required"],
      description: ["string", "required"],
    },
    handler: (req, res) => {
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
    validation: {
      title: ["string"],
      description: ["string"],
    },
    handler: (req, res) => {
      if (!Object.keys(req.body).length)
        return res.badRequest("No data provided to update the task");

      const { id } = req.params;
      const task = database.select<Task>("tasks", id);

      if (!task) return res.badRequest("Task not found");

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
  {
    method: "POST",
    path: buildRoutePath("/tasks/upload"),
    handler: async (req, res) => {
      const bb = busboy({ headers: req.headers });
      const tasks: Task[] = [];

      bb.on("file", async (name, file) => {
        if (name === "csv") {
          const parser = file.pipe(parse({ delimiter: ";", columns: true }));
          const sendDate = new Date().getTime();
          let i = 0;

          for await (const task of parser) {
            i++;
            database.insert<Task>("tasks", { ...task, completed_at: null });
            tasks.push(task);
            console.log(
              `Inserted task: ${i} |`,
              `Time: ${new Date().getTime() - sendDate}ms`
            );
          }
        }
      });

      req.pipe(bb);
      res.ok(tasks, 201);
    },
  },
];
