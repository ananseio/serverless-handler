import { APIGatewayEvent, Context, ProxyResult } from 'aws-lambda';
import { HTTPEvent, HTTPResponse } from '../HTTP';
import { FunctionHandler, Handler } from './FunctionHandler';
import { HTTP } from './HTTP';

const context: Context = <Context>{};

const event: APIGatewayEvent = <any>{
  httpMethod: 'POST',
  headers: {
    origin: 'www.example.com'
  },
  path: '/abc',

  pathParameters: {
    id: 'abc'
  },
  queryStringParameters: {
    q: '123'
  },

  body: '"test"'
};

// tslint:disable-next-line:completed-docs
class HandlerTest extends FunctionHandler {
  @Handler
  @HTTP()
  public async test1(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    expect(this.context).toBe(context);
    expect(this.rawEvent).toBe(event);
    expect(httpEvent).toEqual({
      method: 'POST',
      headers: {
        origin: 'www.example.com'
      },
      path: '/abc',
      parameters: { id: 'abc' },
      query: { q: '123' },
      body: 'test'
    });

    return this.resp.ok({ str: httpEvent.body });
  }

  @Handler
  @HTTP()
  public async test2(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    throw this.resp.ok({ str: httpEvent.body });
  }

  @Handler
  @HTTP()
  public async test3(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    throw httpEvent.body;
  }

  @Handler
  @HTTP({ cors: {} })
  public async cors1(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }

  @Handler
  @HTTP({ cors: { origins: ['www.example.com'] } })
  public async cors2(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }

  @Handler
  @HTTP({ cors: { credentials: true } })
  public async cors3(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }

  @Handler
  @HTTP({ cors: { origins: ['www.example.com'], credentials: true } })
  public async cors4(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }

  @Handler
  @HTTP({ reqFormat: 'raw', respFormat: 'raw' })
  public async testRaw(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<string>> {
    expect(httpEvent.body).toBe('test request');

    return this.resp.ok('test response');
  }
}

describe('Handler decorator', () => {
  it('should produce decorated functions', () => {
    expect((HandlerTest.prototype.test1 as any).decorated).toEqual(jasmine.any(Function));
  });

  it('should run correctly', async (done) => {
    const resp: ProxyResult = {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ str: 'test' })
    };
    expect(await ((HandlerTest as any)).test1(event, context)).toEqual(resp);
    expect(await ((HandlerTest as any)).test2(event, context)).toEqual(resp);

    done();
  });

  it('should fail', async (done) => {
    try {
      expect(await ((HandlerTest as any)).test3(event, context));
      fail('should not be successful');
    } catch (error) {
      expect(error).toBe('test');
    }

    done();
  });

  describe('CORS policy', () => {
    it('should accept CORS request', async (done) => {
      const respTemplate: Partial<ProxyResult> = { statusCode: 200, body: undefined };

      expect(await ((HandlerTest as any)).cors1(event, context)).toEqual({
        ...respTemplate,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });

      expect(await ((HandlerTest as any)).cors2(event, context)).toEqual({
        ...respTemplate,
        headers: {
          'Access-Control-Allow-Origin': 'www.example.com'
        }
      });

      expect(await ((HandlerTest as any)).cors3(event, context)).toEqual({
        ...respTemplate,
        headers: {
          'Access-Control-Allow-Origin': 'www.example.com',
          'Access-Control-Allow-Credentials': true
        }
      });

      expect(await ((HandlerTest as any)).cors4(event, context)).toEqual({
        ...respTemplate,
        headers: {
          'Access-Control-Allow-Origin': 'www.example.com',
          'Access-Control-Allow-Credentials': true
        }
      });

      done();
    });

    it('should reject CORS request', async (done) => {
      const resp: ProxyResult = { statusCode: 400, headers: {}, body: '' };
      const badEvent: APIGatewayEvent = <any>{
        httpMethod: 'POST',
        headers: {
          origin: 'www.example1.com'
        }
      };

      expect(await ((HandlerTest as any)).cors2(badEvent, context)).toEqual(resp);
      expect(await ((HandlerTest as any)).cors4(badEvent, context)).toEqual(resp);

      done();
    });
  });

  it('should support raw format', async (done) => {
    const resp: ProxyResult = {
      statusCode: 200,
      headers: {},
      body: 'test response'
    };
    expect(await ((HandlerTest as any)).testRaw(
      {
        ...event,
        body: 'test request'
      },
      context)).toEqual(resp);

    done();
  });
});
