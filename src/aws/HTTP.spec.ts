import { FunctionHandler, Handler } from "./FunctionHandler";
import { HTTP } from "./HTTP";
import { HTTPEvent, HTTPResponse } from "../HTTP";

const context: any = {};

const event = {
  httpMethod: "POST",
  headers: {
    origin: "www.example.com"
  },
  path: "/abc",

  pathParameters: {
    id: "abc"
  },
  queryStringParameters: {
    q: "123"
  },

  body: '"test"'
};

class HandlerTest extends FunctionHandler {
  @Handler
  @HTTP()
  async test1(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    expect(this.context).toBe(context);
    expect(this.rawEvent).toBe(event);
    expect(httpEvent).toEqual({
      method: "POST",
      headers: {
        origin: "www.example.com"
      },
      path: "/abc",
      parameters: { id: "abc" },
      query: { q: "123" },
      body: "test"
    });

    return this.resp.ok({ str: httpEvent.body });
  }

  @Handler
  @HTTP()
  async test2(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    throw this.resp.ok({ str: httpEvent.body });
  }

  @Handler
  @HTTP()
  async test3(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    throw httpEvent.body;
  }

  @Handler
  @HTTP({ cors: {} })
  async cors1(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }

  @Handler
  @HTTP({ cors: { origins: ["www.example.com"] } })
  async cors2(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }

  @Handler
  @HTTP({ cors: { credentials: true } })
  async cors3(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }

  @Handler
  @HTTP({ cors: { origins: ["www.example.com"], credentials: true } })
  async cors4(httpEvent: HTTPEvent<string>): Promise<HTTPResponse<{ str: string }>> {
    return this.resp.ok();
  }
}

describe("Handler decorator", () => {
  it("should produce decorated functions", () => {
    expect((HandlerTest.prototype.test1 as any).decorated).toEqual(jasmine.any(Function));
  });

  it("should run correctly", async (done) => {
    const resp = {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ str: "test" })
    };
    expect(await ((HandlerTest as any)).test1(event, context)).toEqual(resp);
    expect(await ((HandlerTest as any)).test2(event, context)).toEqual(resp);

    done();
  });

  it("should fail", async (done) => {
    try {
      expect(await ((HandlerTest as any)).test3(event, context));
      fail("should not be successful");
    } catch (error) {
      expect(error).toBe("test");
    }

    done();
  });

  describe("CORS policy", () => {
    it("should accept CORS request", async (done) => {
      const respTemplate = { statusCode: 200, body: undefined };

      expect(await ((HandlerTest as any)).cors1(event, context)).toEqual({
        ...respTemplate,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
      });

      expect(await ((HandlerTest as any)).cors2(event, context)).toEqual({
        ...respTemplate,
        headers: {
          "Access-Control-Allow-Origin": "www.example.com"
        },
      });

      expect(await ((HandlerTest as any)).cors3(event, context)).toEqual({
        ...respTemplate,
        headers: {
          "Access-Control-Allow-Origin": "www.example.com",
          "Access-Control-Allow-Credentials": true
        },
      });

      expect(await ((HandlerTest as any)).cors4(event, context)).toEqual({
        ...respTemplate,
        headers: {
          "Access-Control-Allow-Origin": "www.example.com",
          "Access-Control-Allow-Credentials": true
        },
      });

      done();
    });

    it("should reject CORS request", async (done) => {
      const resp = { statusCode: 400, headers: {}, body: "" };
      const event = {
        httpMethod: "POST",
        headers: {
          origin: "www.example1.com"
        }
      };;

      expect(await ((HandlerTest as any)).cors2(event, context)).toEqual(resp);
      expect(await ((HandlerTest as any)).cors4(event, context)).toEqual(resp);

      done();
    });
  });
});
