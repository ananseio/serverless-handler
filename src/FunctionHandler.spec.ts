import { FunctionHandler } from './FunctionHandler';

describe('FunctionHandler', () => {
  it('should construct properly', () => {
    const event: {} = {};
    const context: {} = {};
    const handler: FunctionHandler<{}> = new FunctionHandler(event, context);
    expect(handler.resp.headers).toEqual({});
    expect(handler.rawEvent).toBe(event);
    expect(handler.context).toBe(context);
  });
});
