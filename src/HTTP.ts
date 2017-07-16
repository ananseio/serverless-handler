export interface StringMap {
  [name: string]: string;
}

export interface Headers {
  [header: string]: boolean | number | string;
}

export interface HTTPEvent<Body = never> {
  method: string;
  headers: StringMap;
  path: string;

  parameters: StringMap;
  query: StringMap;

  body: Body;
}

/**
 * HTTP response
 */
export class HTTPResponse<Body> {
  public code: number;
  public headers: Headers;
  public body?: Body;

  /**
   * Creates a new HTTP response
   * @param   statusCode  The HTTP status code
   */
  constructor(code: number, headers?: Headers, body?: Body) {
    this.code = code;
    this.headers = { ...headers || {} };
    this.body = body || undefined;
  }

  /**
   * Add a new header to the response
   * @returns this for call chaining
   */
  public header(name: string, value: boolean | number | string): this {
    this.headers = {
      [name]: value,
      ...this.headers
    };

    return this;
  }
}
