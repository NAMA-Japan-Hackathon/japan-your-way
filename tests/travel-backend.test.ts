import test from "node:test";
import assert from "node:assert/strict";
import {
  usesSharedTravelApi,
  SharedTravelApi,
} from "../src/lib/travel-backend.server";

test("a clean checkout uses the shared backend without provider keys", () => {
  assert.equal(usesSharedTravelApi({}), true);
  assert.equal(usesSharedTravelApi({ GROQ_API_KEY: "local" }), false);
  assert.equal(
    usesSharedTravelApi({ TRAVEL_API_MODE: "shared", GROQ_API_KEY: "local" }),
    true,
  );
  assert.equal(usesSharedTravelApi({ TRAVEL_API_MODE: "local" }), false);
});
test("relay keeps upstream cookies server-side, reuses a session, and strips caller credentials", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const relay = new SharedTravelApi(async (url, init) => {
    calls.push({ url: String(url), init });
    if (init?.method !== "POST")
      return Response.json(
        { connected: true, searchConnected: true, hotelConnected: true },
        {
          headers: {
            "set-cookie": "jyw_travel=remote.signed; HttpOnly; Secure",
          },
        },
      );
    return Response.json({ message: "Japan travel help", suggestions: [] });
  });
  const status = await relay.status("local-session");
  assert.equal(status.connected, true);
  await relay.post("local-session", "travel", {
    mode: "chat",
    messages: [{ role: "user", content: "Japan travel help" }],
  });
  assert.equal(calls.length, 2);
  const headers = new Headers(calls[1].init?.headers);
  assert.equal(headers.get("cookie"), "jyw_travel=remote.signed");
  assert.equal(headers.get("authorization"), null);
  assert.equal(headers.get("origin"), new URL(calls[1].url).origin);
  assert.equal(calls[1].init?.redirect, "manual");
});
test("login walls and unavailable shared APIs produce actionable errors", async () => {
  const relay = new SharedTravelApi(
    async () =>
      new Response("Sign in required", {
        status: 401,
        headers: { "content-type": "text/html" },
      }),
  );
  const status = await relay.status("session");
  assert.equal(status.connected, false);
  assert.match(status.connectionError || "", /shared|Cloudflare/i);
  await assert.rejects(
    () => relay.post("session", "travel", {}),
    /shared|Cloudflare/i,
  );
});
test("a shared-API outage never silently submits a trip to an unconfigured provider", async () => {
  const relay = new SharedTravelApi(async () => {
    throw Error("offline");
  });
  assert.equal((await relay.status("session")).connected, false);
  await assert.rejects(
    () => relay.post("session", "availability", {}),
    /shared|Cloudflare/i,
  );
});
