import { TravelError } from "./travel.server";

// Public service address, never a provider credential. Browsers use our local
// /api routes; only the server connects to the shared Cloudflare service.
export const SHARED_TRAVEL_API =
  "https://japan-your-way-api-nama.satinyshell1.chatgpt.site";
type Environment = Record<string, string | undefined>;
type ConnectionStatus = {
  connected: boolean;
  searchConnected: boolean;
  hotelConnected: boolean;
  backend: "cloudflare";
  connectionError?: string;
};
export function usesSharedTravelApi(env: Environment = process.env): boolean {
  if (env.TRAVEL_API_MODE === "local") return false;
  if (env.TRAVEL_API_MODE === "shared") return true;
  return !env.GROQ_API_KEY && !env.SERPAPI_API_KEY && !env.LITEAPI_KEY;
}
const unavailable =
  "The shared Cloudflare travel API is unavailable. Your trip is still here; please retry later, or configure your own provider keys in .env.local.";
function cookieFrom(response: Response) {
  const value = response.headers
    .get("set-cookie")
    ?.match(/(?:^|;\s*)jyw_travel=([A-Za-z0-9_.%-]{1,300})(?:;|$)/)?.[1];
  return value ? `jyw_travel=${value}` : "";
}
type RemoteSession = {
  cookie: string;
  until: number;
  status: ConnectionStatus;
};
export class SharedTravelApi {
  private sessions = new Map<string, RemoteSession>();
  constructor(private fetcher: typeof fetch = fetch) {}
  private prune() {
    const now = Date.now();
    for (const [key, value] of this.sessions)
      if (value.until <= now) this.sessions.delete(key);
    if (this.sessions.size >= 1000)
      this.sessions.delete(this.sessions.keys().next().value!);
  }
  async status(sessionId: string): Promise<ConnectionStatus> {
    this.prune();
    const cached = this.sessions.get(sessionId);
    if (cached) return cached.status;
    try {
      const response = await this.fetcher(`${SHARED_TRAVEL_API}/api/travel/`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      )
        throw new Error();
      const data = await response.json();
      const status: ConnectionStatus = {
        connected: data.connected === true,
        searchConnected: data.searchConnected === true,
        hotelConnected: data.hotelConnected === true,
        backend: "cloudflare",
      };
      const cookie = cookieFrom(response);
      if (!status.connected || !cookie) throw new Error();
      this.sessions.set(sessionId, {
        cookie,
        status,
        until: Date.now() + 15 * 60000,
      });
      return status;
    } catch {
      return {
        connected: false,
        searchConnected: false,
        hotelConnected: false,
        backend: "cloudflare",
        connectionError: unavailable,
      };
    }
  }
  async post(
    sessionId: string,
    route: "travel" | "availability",
    body: unknown,
  ): Promise<unknown> {
    const status = await this.status(sessionId);
    const remote = this.sessions.get(sessionId);
    if (!status.connected || !remote) throw new TravelError(503, unavailable);
    const path =
      route === "availability" ? "/api/travel/availability/" : "/api/travel/";
    let response: Response;
    try {
      response = await this.fetcher(SHARED_TRAVEL_API + path, {
        method: "POST",
        cache: "no-store",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: SHARED_TRAVEL_API,
          Cookie: remote.cookie,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(route === "availability" ? 150000 : 90000),
      });
    } catch {
      throw new TravelError(502, unavailable);
    }
    if (!response.headers.get("content-type")?.includes("application/json"))
      throw new TravelError(502, unavailable);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403)
        this.sessions.delete(sessionId);
      throw new TravelError(
        response.status === 429 ? 429 : 502,
        response.status === 429
          ? "The shared travel API has reached its current allowance. Please try again later."
          : unavailable,
      );
    }
    if (!data || typeof data !== "object")
      throw new TravelError(502, unavailable);
    return data;
  }
}
export const sharedTravelApi = new SharedTravelApi();
