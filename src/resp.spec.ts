import { HTTPResponse } from './HTTP';
import { resp } from './resp';

describe('resp', () => {
  it('should create responses', () => {
    expect(resp(200)).toEqual(new HTTPResponse(200, {}));
    expect(resp(200, 'body')).toEqual(new HTTPResponse(200, {}, 'body'));

    expect(resp.ok('body')).toEqual(new HTTPResponse(200, {}, 'body'));

    expect(resp.moved('url')).toEqual(new HTTPResponse(301, { Location: 'url' }));
    expect(resp.found('url')).toEqual(new HTTPResponse(302, { Location: 'url' }));

    expect(resp.badRequest('body')).toEqual(new HTTPResponse(400, {}, 'body'));
    expect(resp.unauthorized('body')).toEqual(new HTTPResponse(401, {}, 'body'));
    expect(resp.forbidden('body')).toEqual(new HTTPResponse(403, {}, 'body'));
    expect(resp.notFound('body')).toEqual(new HTTPResponse(404, {}, 'body'));

    expect(resp.internalError('body')).toEqual(new HTTPResponse(500, {}, 'body'));
  });
});
