import { failure, guard, readBody } from "@/lib/travel-http.server";
import { TravelError } from "@/lib/travel.server";
import {
  matchesSchema,
  profileSchema,
  validItinerary,
  type Profile,
} from "@/lib/travel";
import { searchAvailability } from "@/lib/travel-search.server";
import {
  sharedTravelApi,
  usesSharedTravelApi,
} from "@/lib/travel-backend.server";
import { validSearches } from "@/lib/travel";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 150;
export async function POST(request: Request) {
  try {
    const token = guard(request);
    const body = await readBody(request);
    if (
      !matchesSchema(body.profile, profileSchema) ||
      !validItinerary(body.itinerary)
    )
      throw new TravelError(
        400,
        "Please finish your trip draft before checking prices.",
      );
    if (usesSharedTravelApi()) {
      const result = (await sharedTravelApi.post(token, "availability", {
        profile: body.profile,
        itinerary: body.itinerary,
      })) as { searches?: unknown };
      if (!validSearches(result.searches))
        throw new TravelError(
          502,
          "The shared price search returned an incomplete response. Please retry.",
        );
      return Response.json(result, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    return Response.json(
      {
        searches: await searchAvailability(
          body.profile as Profile,
          body.itinerary,
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
