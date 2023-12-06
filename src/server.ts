import http from "node:http";
import { Request, Response } from "./config/http";
import { json } from "./middlewares/json";
import { routes } from "./routes";
import { extractQueryParams } from "./utils/extract-query-params";
import { validate } from "./utils/validate";

const server = http.createServer({
  IncomingMessage: Request,
  ServerResponse: Response as any,
});

server.on("request", async (req, res) => {
  const { method, url } = req;

  if (!method || !url) return res.writeHead(404).end();

  await json(req, res);

  const route = routes.find(route => {
    return route.method === method && route.path.test(url);
  });

  if (route) {
    const { groups } = url.match(route.path) as RegExpMatchArray;
    const { queryParams, ...routeParams } = groups!;

    req.query = queryParams ? extractQueryParams(queryParams) : {};
    req.params = routeParams;

    if (route.validation) {
      const isValid = validate(route.validation, req.body, res);

      if (!isValid) return;
    }

    return route.handler(req, res);
  }

  res.writeHead(404).end();
});

server.listen(3333);
