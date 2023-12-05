import { ServerResponse } from "http";
import { Request } from "../config/http";

export async function json(req: Request, res: ServerResponse) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString());
  } catch {
    req.body = null;
  }

  res.setHeader("Content-Type", "application/json");
}
