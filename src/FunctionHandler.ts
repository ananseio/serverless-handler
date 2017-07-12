import { resp } from './resp';

export interface HandlerFunction {
  decorated?: HandlerFunction;

  (event: any): Promise<any>;
  call(thisArg: FunctionHandler<any>, event: any): Promise<any>;
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
  new(event: any, context: any): Handler;
}
