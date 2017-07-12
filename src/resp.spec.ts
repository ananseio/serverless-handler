import { resp } from "./resp";
import { HTTPResponse } from "./HTTP";

describe("resp", () => {
  it("should create responses", () => {
    expect(resp(200)).toEqual(new HTTPResponse(200, {}, undefined) as any);
    expect(resp(200, "body")).toEqual(new HTTPResponse(200, {}, "body") as any);

    expect(resp.ok("body")).toEqual(new HTTPResponse(200, {}, "body") as any);

    expect(resp.moved("url")).toEqual(new HTTPResponse(301, { Location: "url" }, undefined) as any);
    expect(resp.found("url")).toEqual(new HTTPResponse(302, { Location: "url" }, undefined) as any);

    expect(resp.badRequest("body")).toEqual(new HTTPResponse(400, {}, "body") as any);
    expect(resp.unauthorized("body")).toEqual(new HTTPResponse(401, {}, "body") as any);
    expect(resp.forbidden("body")).toEqual(new HTTPResponse(403, {}, "body") as any);
    expect(resp.notFound("body")).toEqual(new HTTPResponse(404, {}, "body") as any);

    expect(resp.internalError("body")).toEqual(new HTTPResponse(500, {}, "body") as any);
  });
});
