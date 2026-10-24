import { failure, guard, readBody } from "@/lib/travel-http.server";
import { TravelError } from "@/lib/travel.server";
import {
  matchesSchema,
  profileSchema,
  validItinerary,
  type Profile,
} from "@/lib/travel";
import { searchAvailability } from "@/lib/travel-search.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 150;
export async function POST(request: Request) {
  try {
    guard(request);
    const body = await readBody(request);
    if (
      !matchesSchema(body.profile, profileSchema) ||
      !validItinerary(body.itinerary)
    )
      throw new TravelError(
        400,
        "Please finish your trip draft before checking prices.",
      );
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
