import { APIGatewayEvent, ProxyResult } from 'aws-lambda';
import { HandlerFunction } from '../FunctionHandler';
import { Headers, HTTPEvent, HTTPResponse } from '../HTTP';
import { FunctionHandler } from './FunctionHandler';

export type DataFormat = 'json' | 'raw';

export interface HTTPOptions {
  /**
   * Request body format
   */
  reqFormat?: DataFormat;

  /**
   * Response body format.
   */
  respFormat?: DataFormat;

  /**
   *  CORS options
   */
  cors?: {
    /**
     * List of allowed origins
     */
    origins?: string[];

    /**
     * Whether credentials (Cookies) are allowed to be sent
     */
    credentials?: boolean;
  };
}

function createCorsHeaders(opts: HTTPOptions, event: HTTPEvent<{}>): Headers | null {
  const headers: Headers = {};
  if (opts.cors) {
    if (!opts.cors.origins && !opts.cors.credentials) {
      headers['Access-Control-Allow-Origin'] = '*';
    } else if (!opts.cors.origins || opts.cors.origins.indexOf(event.headers.origin) >= 0) {
      headers['Access-Control-Allow-Origin'] = event.headers.origin;
    } else {
      return null;
    }

    if (opts.cors.credentials) {
      headers['Access-Control-Allow-Credentials'] = true;
    }
  }

  return headers;
}

export namespace HTTP {
  export type Event<Body = never> = HTTPEvent<Body>;
  export type Response<Body> = HTTPResponse<Body>;
}

export function HTTP(options?: HTTPOptions) {
  const opts: HTTPOptions = options || {};

  const deserialize: (body: string | null | undefined) => any =
    (opts.reqFormat === 'raw' && (body => Buffer.from(body || '', 'base64'))) ||
    (body => JSON.parse(body || 'null'));

  const serialize: (body: any) => string =
    (opts.respFormat === 'raw' && (body => Buffer.from(body).toString('base64'))) ||
    (body => JSON.stringify(body));

  const isBase64Encoded = opts.respFormat === 'raw';

  return (target: Object, name: string, desc: TypedPropertyDescriptor<HandlerFunction>): void => {
    const handler: HandlerFunction = desc.value!.decorated || desc.value!;

    function httpHandler(this: FunctionHandler, event: APIGatewayEvent): Promise<ProxyResult> {
      const httpEvent: HTTPEvent<any> = {
        method: event.httpMethod,
        headers: event.headers,
        path: event.path,

        parameters: event.pathParameters || {},
        query: event.queryStringParameters || {},

        body: deserialize(event.body)
      };

      const headers: Headers | null = createCorsHeaders(opts, httpEvent);
      if (!headers) {
        return Promise.resolve({
          statusCode: 400,
          headers: {},
          body: '',
          isBase64Encoded
        });
      }
      this.resp.headers = headers;

      function toResult(resp: HTTPResponse<{}>): Promise<ProxyResult> {
        return Promise.resolve({
          statusCode: resp.code,
          headers: resp.headers,
          body: serialize(resp.body),
          isBase64Encoded
        });
      }

      return handler.call(this, httpEvent)
        .then(toResult)
        .catch((err: {}) => err instanceof HTTPResponse ? toResult(err) : Promise.reject(err));
    }

    desc.value!.decorated = httpHandler;
  };
}
