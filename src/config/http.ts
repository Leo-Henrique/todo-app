import http from "node:http";
import { Socket } from "node:net";

export class Request extends http.IncomingMessage {
  body: null | Record<string, any>;
  query: Record<string, string>;
  params: Record<string, string>;

  constructor(socket: Socket) {
    super(socket);
    this.body = null;
    this.query = {};
    this.params = {};
  }
}
