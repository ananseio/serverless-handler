import { FunctionHandler, Handler } from './FunctionHandler';

const context: any = {};

// tslint:disable-next-line:completed-docs
class HandlerTest extends FunctionHandler {
  @Handler
  public test1(str: string): Promise<string> {
    expect(this.rawEvent).toBe(str);
    expect(this.context).toBe(context);

    return Promise.resolve(str);
  }

  @Handler
  public test2(str: string): Promise<void> {
    throw str;
  }

  @Handler
  public test3(str: string): Promise<void> {
    return Promise.reject(str);
  }
}

describe('Handler decorator', () => {
  it('should produce static handler functions', () => {
    expect((HandlerTest as any).test1).toEqual(jasmine.any(Function));
    expect((HandlerTest as any).test2).toEqual(jasmine.any(Function));
    expect((HandlerTest as any).test3).toEqual(jasmine.any(Function));
  });

  it('should run correctly with callback', () => {
    ((HandlerTest as any)).test1('test1', context, (error1: any, result1: any) => {
      expect(error1).toBeUndefined();
      expect(result1).toBe('test1');

      ((HandlerTest as any)).test2('test2', context, (error2: any, result2: any) => {
        expect(error2).toBe('test2');
        expect(result2).toBeUndefined();

        ((HandlerTest as any)).test3('test3', context, (error3: any, result3: any) => {
          expect(error3).toBe('test3');
          expect(result3).toBeUndefined();
        });
      });
    });
  });

  it('should run correctly without callback', async (done) => {
    expect(await ((HandlerTest as any)).test1('test1', context)).toBe('test1');

    try {
      await ((HandlerTest as any)).test2('test2', context);
      fail('should not be successful');
    } catch (error) {
      expect(error).toBe('test2');
    }

    try {
      await ((HandlerTest as any)).test3('test3', context);
      fail('should not be successful');
    } catch (error) {
      expect(error).toBe('test3');
    }

    done();
  });
});
