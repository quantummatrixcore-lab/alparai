import { describe, expect, it } from "vitest";
import { GET, OPTIONS } from "./route";
import { NextRequest } from "next/server";

describe("/api/badge API Route", () => {
  it("handles OPTIONS request with CORS headers", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns default alpar provider badge data on GET", async () => {
    const req = new NextRequest("http://localhost:3000/api/badge");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.provider).toBe("alpar");
    expect(data.score).toBeGreaterThan(90);
    expect(data.verified).toBe(true);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("returns specific known provider data when query param is present", async () => {
    const req = new NextRequest("http://localhost:3000/api/badge?provider=anthropic");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.provider).toBe("anthropic");
    expect(data.name).toBe("Anthropic");
    expect(data.score).toBe(96.5);
  });

  it("handles unknown provider with valid fallback score data", async () => {
    const req = new NextRequest("http://localhost:3000/api/badge?provider=customai");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.provider).toBe("customai");
    expect(data.name).toBe("Customai");
    expect(data.score).toBe(88.5);
  });
});
