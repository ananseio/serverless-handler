import { Headers, HTTPResponse } from "./HTTP";

export function resp<Body>(code: number, body?: Body): HTTPResponse<Body> {
  return new HTTPResponse(code, resp.headers, body);
}

export namespace resp {
  export let headers: Headers;

  // 2XX
  export function ok<Body>(body?: Body) {
    return resp(200, body);
  }

  // 3XX
  export function moved(location: string) {
    return resp(301).header("Location", location);
  }

  export function found(location: string) {
    return resp(302).header("Location", location);
  }

  // 4XX
  export function badRequest<Body>(body?: Body) {
    return resp(400, body);
  }

  export function unauthorized<Body>(body?: Body) {
    return resp(401, body);
  }

  export function forbidden<Body>(body?: Body) {
    return resp(403, body);
  }

  export function notFound<Body>(body?: Body) {
    return resp(404, body);
  }

  // 5XX
  export function internalError<Body>(body?: Body) {
    return resp(500, body);
  }
}
