import { resp } from './resp';

export interface HandlerFunction<Context = any, Event = any, Response = any> {
  decorated?: HandlerFunction;

  (this: FunctionHandler<Context>, event: Event): Promise<Response>;
  call(thisArg: FunctionHandler<Context>, event: Event): Promise<Response>;
}

/**
 * Serverless function handler class
 */
export class FunctionHandler<Context> {
  /**
   *  Raw event passed to the function handler.
   */
  public rawEvent: any;

  /**
   *  Context object passed to the function handler.
   */
  public context: Context;

  /**
   *  HTTP response helper.
   */
  public resp: typeof resp;

  constructor(rawEvent: any, context: Context) {
    this.rawEvent = rawEvent;
    this.context = context;
    this.resp = resp;
    this.resp.headers = {};
  }
}

export interface FunctionHandlerConstructor<Handler extends FunctionHandler<any>> {
  readonly prototype: Handler;

  new(event: any, context: Handler['context']): Handler;
}
