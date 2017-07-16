import { Headers, HTTPResponse } from './HTTP';

export function resp<Body = undefined>(code: number, body?: Body): HTTPResponse<Body> {
  return new HTTPResponse(code, resp.headers, body);
}

export namespace resp {
  export let headers: Headers;

  /**
   * 200 OK
   */
  export function ok<Body = undefined>(body?: Body) {
    return resp(200, body);
  }

  /**
   * 301 Moved Permanently
   */
  export function moved(location: string) {
    return resp(301).header('Location', location);
  }

  /**
   * 302 Found
   */
  export function found(location: string) {
    return resp(302).header('Location', location);
  }

  /**
   * 400 Bad Request
   */
  export function badRequest<Body = undefined>(body?: Body) {
    return resp(400, body);
  }

  /**
   * 401 Unauthorized
   */
  export function unauthorized<Body = undefined>(body?: Body) {
    return resp(401, body);
  }

  /**
   * 403 Forbidden
   */
  export function forbidden<Body = undefined>(body?: Body) {
    return resp(403, body);
  }

  /**
   * 404 Not Found
   */
  export function notFound<Body = undefined>(body?: Body) {
    return resp(404, body);
  }

  /**
   * 500 Internal Server Error
   */
  export function internalError<Body = undefined>(body?: Body) {
    return resp(500, body);
  }
}
