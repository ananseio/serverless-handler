import { resp } from "./resp";

export interface HandlerFunction {
  (event: any): Promise<any>;
  call(thisArg: FunctionHandler<any>, event: any): Promise<any>;

  decorated?: HandlerFunction;
}

export class FunctionHandler<Context> {
  resp = resp;

  constructor(public rawEvent: any, public context: Context) {
    this.resp.headers = {};
  }
}

export interface FunctionHandlerConstructor<Handler extends FunctionHandler<any>> {
  new(event: any, context: any): Handler;
}
