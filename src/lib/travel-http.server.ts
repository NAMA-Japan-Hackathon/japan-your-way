import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { TravelError } from "./travel.server";

const secret =
  process.env.TRAVEL_SESSION_SECRET ||
  process.env.GROQ_API_KEY ||
  process.env.SERPAPI_API_KEY ||
  process.env.LITEAPI_KEY ||
  randomUUID();
const buckets = new Map<string, { count: number; until: number }>();
const sign = (id: string) =>
  createHmac("sha256", secret).update(id).digest("hex");
const isLoopback = (host: string) =>
  host === "localhost" ||
  host === "127.0.0.1" ||
  host === "[::1]" ||
  host === "::1";

function originsMatch(originStr: string, expectedOriginStr: string): boolean {
  if (originStr === expectedOriginStr) return true;
  try {
    const o = new URL(originStr);
    const e = new URL(expectedOriginStr);
    if (
      o.protocol === e.protocol &&
      o.port === e.port &&
      isLoopback(o.hostname) &&
      isLoopback(e.hostname)
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function sessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const matches = cookieHeader.matchAll(/(?:^|;\s*)jyw_travel=([^;]+)/g);
  for (const match of matches) {
    const raw = decodeURIComponent(match[1].trim());
    const [id, signature] = raw.split(".");
    if (
      id &&
      /^[\w-]{36}$/.test(id) &&
      /^[a-f0-9]{64}$/.test(signature || "")
    ) {
      const expectedSign = sign(id);
      if (
        Buffer.byteLength(expectedSign) === Buffer.byteLength(signature) &&
        timingSafeEqual(Buffer.from(expectedSign), Buffer.from(signature))
      ) {
        return raw;
      }
    }
  }
  const next = randomUUID();
  return `${next}.${sign(next)}`;
}
export function sessionCookie(request: Request, token: string) {
  const proto =
    request.headers.get("x-forwarded-proto") ||
    new URL(request.url).protocol.replace(/:$/, "");
  return `jyw_travel=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${proto === "https" ? "; Secure" : ""}`;
}
export function guard(request: Request) {
  let origin = request.headers.get("origin");
  if (!origin || origin === "null") {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        origin = new URL(referer).origin;
      } catch {}
    }
  }
  const url = new URL(request.url);
  const proto =
    request.headers.get("x-forwarded-proto") ||
    url.protocol.replace(/:$/, "");
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    url.host;
  const expectedOrigin =
    process.env.APP_ORIGIN || `${proto}://${host}`;

  let isOriginValid = false;
  let isLoopbackOrigin = false;
  if (origin) {
    isOriginValid = originsMatch(origin, expectedOrigin);
    try {
      isLoopbackOrigin = isLoopback(new URL(origin).hostname);
    } catch {}
  }

  if (
    !origin ||
    !isOriginValid ||
    (request.headers.get("sec-fetch-site") === "cross-site" && !isLoopbackOrigin)
  )
    throw new TravelError(
      403,
      "Please open the assistant from this website and try again.",
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new TravelError(415, "Please send a valid conversation.");
  const token = sessionToken(request);
  if (!request.headers.get("cookie")?.includes(`jyw_travel=${token}`))
    throw new TravelError(403, "Please reopen the assistant and try again.");
  const now = Date.now();
  for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
  for (const [key, limit] of [
    ["all", Number(process.env.TRAVEL_HOURLY_LIMIT) || 160],
    [token, 40],
  ] as const) {
    const bucket = buckets.get(key) || { count: 0, until: now + 3600000 };
    if (++bucket.count > limit)
      throw new TravelError(
        429,
        "The assistant has reached its current usage allowance. Please try again later.",
      );
    buckets.set(key, bucket);
  }
  return token;
}
export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    let text = "";
    if (request.body && typeof request.body.getReader === "function") {
      const reader = request.body.getReader();
      const decoder = new TextDecoder();
      let size = 0;
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 120000) {
          await reader.cancel();
          throw new TravelError(
            413,
            "This conversation is too large. Save your trip and start a fresh conversation.",
          );
        }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
    } else {
      text = await request.text();
      if (Buffer.byteLength(text) > 120000) {
        throw new TravelError(
          413,
          "This conversation is too large. Save your trip and start a fresh conversation.",
        );
      }
    }
    if (!text.trim()) throw new TravelError(400, "Your message was empty.");
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error();
    return parsed;
  } catch (error) {
    if (error instanceof TravelError) throw error;
    throw new TravelError(
      400,
      "Your message couldn’t be read. Please try again.",
    );
  }
}
export function failure(error: unknown) {
  const known = error instanceof TravelError;
  return Response.json(
    {
      error: known
        ? error.message
        : "Something interrupted the assistant. Please try again.",
    },
    {
      status: known ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
