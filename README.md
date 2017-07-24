Serverless Handler
==================

Common library for writing functions in Serverless Framework. Supports AWS Lambda at the moment.

Features
--------

- ES6 handler class
- Decorator for simple handler composition
- Easy HTTP event handling
- Promise support
- TypeScript support


Usage
-----

### Installation
1. `npm install @ananseio/serverless-handler`

2. Import the library in handler code
```TypeScript
import { FunctionHandler, Handler, HTTP } from '@ananseio/serverless-handler/aws';
```

### Getting Started

```TypeScript
class TestHandler extends FunctionHandler {
  public static handler: Function;

  @Handler
  public async handler(userName: string) {
    return `Hello, ${userName}!`;
  }
}

export = {
  handler: TestHandler.handler
};
```

`@Handler` decorator would transform the promise-style handler into callback-style.
The transformed handler would be stored as a static attribute with the same name as 
the function, which should be exported as the real handler. The `context` parameter
can be access through `this.context`.

A new instance of the handler class will be used for each events, therefore 
the lifetime of instance variables are within single event. To store information 
across requests, use static/global variables. (Note that they are still ephemeral 
and may be reset when not handling events.)

### HTTP handling

```TypeScript
@Handler
@HTTP()
public async handler(event: HTTP.Event<{userName: string}>) {
  return this.resp.ok({message: `Hello, ${event.body.userName}!`});
}
```

`@HTTP` decorator would transform the incoming API Gateway event into a simpler 
format for consumption (request body is parsed as JSON).
The raw event can be access through `this.rawEvent`.

HTTP responses can be created through `this.resp` helper function.
Here are some examples:

```TypeScript
return this.resp(503, { message: 'Unavailable' });

return this.resp.ok();

return this.resp.found('https://example.com/');

return this.resp(301)
           .header('Location', 'https://example.com/')
           .header('Set-Cookie', 'session=undefined');
```

### CORS headers

```TypeScript
@Handler
@HTTP({ cors: { origins: ['www.example.com'], credentials: true } })
public async handler(event: HTTP.Event<{userName: string}>) {
  return this.resp.ok({message: `Hello, ${userName}!`});
}
```

CORS headers can be attached automatically by specifiying details to `@HTTP` decorator.
Note that pre-flight responses need to be configured separately (e.g. in serverless.yml).
Here are some examples:

```TypeScript
// All origins can access this resource (no cookies)
@HTTP({ cors: {} })

// Request originated from 'https://www.example.com' can access this resource (no cookies)
@HTTP({ cors: { origins: ['https://www.example.com'] } })

// All origins can access this resource (with cookies and inferred Access-Control-Allow-Origin header)
@HTTP({ cors: { credentials: true } })
```

