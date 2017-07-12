import { FunctionHandler, Handler } from "./FunctionHandler";

const context: any = {};

class HandlerTest extends FunctionHandler {
  @Handler
  test1(str: string): Promise<string> {
    expect(this.rawEvent).toBe(str);
    expect(this.context).toBe(context);

    return Promise.resolve(str);
  }

  @Handler
  test2(str: string): Promise<void> {
    throw str;
  }

  @Handler
  test3(str: string): Promise<void> {
    return Promise.reject(str);
  }
}

describe("Handler decorator", () => {
  it("should produce static handler functions", () => {
    expect((HandlerTest as any).test1).toEqual(jasmine.any(Function));
    expect((HandlerTest as any).test2).toEqual(jasmine.any(Function));
    expect((HandlerTest as any).test3).toEqual(jasmine.any(Function));
  });

  it("should run correctly with callback", () => {
    ((HandlerTest as any)).test1("test1", context, (error: any, result: any) => {
      expect(error).toBeUndefined();
      expect(result).toBe("test1");

      ((HandlerTest as any)).test2("test2", context, (error: any, result: any) => {
        expect(error).toBe("test2");
        expect(result).toBeUndefined();

        ((HandlerTest as any)).test3("test3", context, (error: any, result: any) => {
          expect(error).toBe("test3");
          expect(result).toBeUndefined();
        });
      });
    });
  });


  it("should run correctly without callback", async (done) => {
    expect(await ((HandlerTest as any)).test1("test1", context)).toBe("test1");

    try {
      await ((HandlerTest as any)).test2("test2", context);
      fail("should not be successful");
    } catch (error) {
      expect(error).toBe("test2");
    }

    try {
      await ((HandlerTest as any)).test3("test3", context);
      fail("should not be successful");
    } catch (error) {
      expect(error).toBe("test3");
    }

    done();
  });
});
