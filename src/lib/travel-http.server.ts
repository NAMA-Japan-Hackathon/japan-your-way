import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { TravelError } from "./travel.server";

const secret =
  process.env.TRAVEL_SESSION_SECRET ||
  process.env.GROQ_API_KEY ||
  process.env.SERPAPI_API_KEY ||
  process.env.LITEAPI_KEY ||
  "unconnected-local-planner";
const buckets = new Map<string, { count: number; until: number }>();
const sign = (id: string) =>
  createHmac("sha256", secret).update(id).digest("hex");
export function sessionToken(request: Request) {
  const token =
    request.headers.get("cookie")?.match(/(?:^|;\s*)jyw_travel=([^;]+)/)?.[1] ||
    "";
  const [id, signature] = token.split(".");
  if (
    id &&
    /^[\w-]{36}$/.test(id) &&
    /^[a-f0-9]{64}$/.test(signature || "") &&
    timingSafeEqual(Buffer.from(sign(id)), Buffer.from(signature))
  )
    return token;
  const next = randomUUID();
  return `${next}.${sign(next)}`;
}
export function sessionCookie(request: Request, token: string) {
  return `jyw_travel=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export function guard(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const expectedOrigin =
    process.env.APP_ORIGIN ||
    `${url.protocol}//${request.headers.get("host") || url.host}`;
  if (
    !origin ||
    origin !== expectedOrigin ||
    request.headers.get("sec-fetch-site") === "cross-site"
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
  const reader = request.body?.getReader();
  if (!reader) throw new TravelError(400, "Your message was empty.");
  const decoder = new TextDecoder();
  let text = "",
    size = 0;
  try {
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
