import { completeTravel, TravelError } from "@/lib/travel.server";
import {
  sharedTravelApi,
  usesSharedTravelApi,
} from "@/lib/travel-backend.server";
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
  validInterview,
  chatSchema,
  fitsConfirmedDates,
  type Itinerary,
  type Profile,
} from "@/lib/travel";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;
export async function GET(request: Request) {
  const token = sessionToken(request);
  const status = usesSharedTravelApi()
    ? await sharedTravelApi.status(token)
    : {
        connected: Boolean(process.env.GROQ_API_KEY),
        searchConnected: Boolean(process.env.SERPAPI_API_KEY),
        hotelConnected: Boolean(process.env.LITEAPI_KEY),
        backend: "local",
      };
  return Response.json(status, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": sessionCookie(request, token),
    },
  });
}
export async function POST(request: Request) {
  try {
    const token = guard(request);
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
    if (usesSharedTravelApi()) {
      const result = await sharedTravelApi.post(token, "travel", {
        mode: body.mode,
        messages: body.messages,
        profile,
        itinerary,
        searches,
      });
      const valid =
        body.mode === "generate"
          ? validItinerary(result) &&
            fitsConfirmedDates(result as Itinerary, profile as Profile | null)
          : body.mode === "interview"
            ? validInterview(result)
            : matchesSchema(result, chatSchema);
      if (!valid)
        throw new TravelError(
          502,
          "The shared assistant returned an incomplete response. Your answers are still here; please retry.",
        );
      return Response.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    }
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
