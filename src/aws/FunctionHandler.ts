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
    try {
      const handlerObj: FunctionHandler = new ctor(event, context);

      const promise = handler.call(handlerObj, event) as Promise<any>;
      if (callback) {
        promise
          .then(result => callback(undefined, result))
          .catch(error => callback(error));
      }

      return promise;
    } catch (error) {
      if (callback) {
        callback(error);
      }
      return Promise.reject(error);
    }
  };

  (ctor as any)[name] = wrapper;
}
