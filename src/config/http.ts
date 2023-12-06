import http from "node:http";
import { Socket } from "node:net";

export class Request extends http.IncomingMessage {
  body: any;
  query: any;
  params: any;

  constructor(socket: Socket) {
    super(socket);
    this.body = {};
    this.query = {};
    this.params = {};
  }
}

export class Response extends http.ServerResponse<Request> {
  badRequest(message: string, statusCode: number = 400) {
    return this.writeHead(statusCode).end(JSON.stringify({ error: message }));
  }
  ok(data?: any, statusCode: number = 200) {
    if (data) return this.writeHead(statusCode).end(JSON.stringify(data));

    return this.writeHead(statusCode).end();
  }
}
