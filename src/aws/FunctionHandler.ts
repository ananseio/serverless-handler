import { Context, Callback } from 'aws-lambda';
import {
  HandlerFunction,
  FunctionHandler as FuncHandler,
  FunctionHandlerConstructor
} from "../FunctionHandler";

export class FunctionHandler extends FuncHandler<Context> {
}

export function Handler(target: Object, name: string, desc: TypedPropertyDescriptor<HandlerFunction>) {
  const ctor = target.constructor as FunctionHandlerConstructor<FunctionHandler>;
  const handler = desc.value!.decorated || desc.value!;

  const wrapper = (event: any, context: Context, callback?: Callback) => {
    let promise: Promise<any>;
    try {
      const handlerObj: FunctionHandler = new ctor(event, context);

      promise = handler.call(handlerObj, event) as Promise<any>;
      if (callback) {
        promise
          .then(result => callback(undefined, result))
          .catch(error => callback(error));
      }

    } catch (error) {
      promise = Promise.reject(error);
      if (callback) {
        promise.catch(error => callback(error));
      }
    }
    return promise;
  };

  (ctor as any)[name] = wrapper;
}
