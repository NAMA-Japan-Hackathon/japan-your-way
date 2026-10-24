import { completeTravel, TravelError } from "@/lib/travel.server";
import {
  failure,
  guard,
  readBody,
  sessionCookie,
  sessionToken,
} from "@/lib/travel-http.server";
import {
  matchesSchema,
  profileSchema,
  validItinerary,
  validMessages,
  validSearches,
} from "@/lib/travel";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;
export async function GET(request: Request) {
  return Response.json(
    {
      connected: Boolean(process.env.GROQ_API_KEY),
      searchConnected: Boolean(process.env.SERPAPI_API_KEY),
      hotelConnected: Boolean(process.env.LITEAPI_KEY),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": sessionCookie(request, sessionToken(request)),
      },
    },
  );
}
export async function POST(request: Request) {
  try {
    guard(request);
    const body = await readBody(request);
    if (
      !["interview", "generate", "chat"].includes(String(body.mode)) ||
      !validMessages(body.messages)
    )
      throw new TravelError(
        400,
        "Please send a message of up to 6,000 characters. For a very long trip, start a new conversation.",
      );
    const profile = body.profile == null ? null : body.profile;
    const itinerary = body.itinerary == null ? null : body.itinerary;
    const searches = body.searches == null ? [] : body.searches;
    if (
      (profile && !matchesSchema(profile, profileSchema)) ||
      (itinerary && !validItinerary(itinerary)) ||
      !validSearches(searches)
    )
      throw new TravelError(
        400,
        "The trip context couldn’t be read. Please reopen the planner.",
      );
    const result = await completeTravel(
      body.mode as "interview" | "generate" | "chat",
      body.messages,
      { profile, itinerary, searches },
    );
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return failure(error);
  }
}
