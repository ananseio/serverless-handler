import { Callback, Context } from 'aws-lambda';
import {
  FunctionHandler as FuncHandler,
  FunctionHandlerConstructor,
  HandlerFunction
} from '../FunctionHandler';

/**
 * AWS Lambda function handler
 */
export class FunctionHandler extends FuncHandler<Context> {
}

export function Handler(target: Object, name: string, desc: TypedPropertyDescriptor<HandlerFunction>): void {
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
          .catch(callback);
      }

    } catch (error) {
      promise = Promise.reject(error);
      if (callback) {
        promise.catch(callback);
      }
    }

    return promise;
  };

  (ctor as any)[name] = wrapper;
}
