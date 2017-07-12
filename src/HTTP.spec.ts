import { HTTPResponse } from './HTTP';

describe('HTTPResponse', () => {
  it('should construct properly', () => {
    const resp1: HTTPResponse<string> = new HTTPResponse(200, { test: 'abc' }, 'abc');
    expect({ ...resp1 })
      .toEqual({
        code: 200,
        headers: { test: 'abc' },
        body: 'abc'
      });

    const resp2: HTTPResponse<string> = new HTTPResponse(500);
    expect(resp2.code).toBe(500);
    expect(resp2.headers).toEqual({});
    expect(resp2.body).toBeUndefined();
  });

  it('should add new header', () => {
    const resp1: HTTPResponse<string> = new HTTPResponse(200, {}, 'body');
    expect(resp1.header('test', 123)).toBe(resp1);
    expect(resp1.header('test2', 1234)).toBe(resp1);

    expect({ ...resp1 })
      .toEqual({
        code: 200,
        headers: {
          ['test']: 123,
          ['test2']: 1234
        },
        body: 'body'
      });
  });
});
