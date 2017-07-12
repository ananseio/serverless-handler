import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { FunctionHandler } from "./FunctionHandler";
import { HTTPEvent, HTTPResponse, Headers } from "../HTTP";
import { HandlerFunction } from "../FunctionHandler";

export type HTTPOptions = {
  format?: "json";
  cors?: {
    origins?: string[];
    credentials?: boolean;
  };
}

function createCorsHeaders(opts: HTTPOptions, event: HTTPEvent<any>): Headers | null {
  const headers: Headers = {};
  if (opts.cors) {
    if (!opts.cors.origins && !opts.cors.credentials) {
      headers["Access-Control-Allow-Origin"] = "*";
    }
    else if (!opts.cors.origins || opts.cors.origins.indexOf(event.headers["origin"]) >= 0) {
      headers["Access-Control-Allow-Origin"] = event.headers["origin"];
    } else {
      return null;
    }

    if (opts.cors.credentials) {
      headers["Access-Control-Allow-Credentials"] = true;
    }
  }

  return headers;
}

export function HTTP(options?: HTTPOptions) {
  const opts = options || {};
  const deserialize = (body: string | null | undefined): any => JSON.parse(body || "null");
  const serialize = (body: any): string => JSON.stringify(body);

  return (target: Object, name: string, desc: TypedPropertyDescriptor<HandlerFunction>) => {
    const handler = desc.value!.decorated || desc.value!;

    desc.value!.decorated = function httpHandler(this: FunctionHandler, event: APIGatewayEvent): Promise<ProxyResult> {
      const httpEvent: HTTPEvent<any> = {
        method: event.httpMethod,
        headers: event.headers,
        path: event.path,

        parameters: event.pathParameters || {},
        query: event.queryStringParameters || {},

        body: deserialize(event.body)
      };

      const headers = createCorsHeaders(opts, httpEvent);
      if (!headers) {
        return Promise.resolve({
          statusCode: 400,
          headers: {},
          body: ""
        });
      }
      this.resp.headers = headers;

      const toResult = (resp: HTTPResponse<any>) => Promise.resolve({
        statusCode: resp.code,
        headers: resp.headers,
        body: serialize(resp.body)
      });

      return handler.call(this, httpEvent)
        .then((resp: HTTPResponse<any>) => toResult(resp))
        .catch((err: any) => err instanceof HTTPResponse ? toResult(err) : Promise.reject(err))
    };
  }
}
