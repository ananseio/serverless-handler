export interface StringMap {
  [name: string]: string
}

export interface Headers {
  [header: string]: boolean | number | string;
}

export interface HTTPEvent<Body=never> {
  method: string;
  headers: StringMap;
  path: string;

  parameters:StringMap;
  query: StringMap;

  body: Body;
}

export class HTTPResponse<Body> {
  code: number;
  headers: Headers;
  body: Body;

  /**
   * Creates a new HTTP response
   * @param   statusCode  The HTTP status code
   */
  constructor(code: number, headers: Headers, body?: Body) {
    this.code = code;
    this.headers = { ...headers };
    if (body) {
      this.body = body;
    }
  }

  /**
   * Add a new header to the response
   * @returns this for call chaining
   */
  header(name: string, value: boolean | number | string): this {
    this.headers = {
      [name]: value,
      ...(this.headers || {})
    };
    return this;
  }

  /**
   * Set the content of the response
   * @param content   the content as a JS object
   * @returns this for call chaining
   */
  content(content: any): this {
    this.body = content;
    return this;
  }
}
