import {
  validDate,
  safeHotelImage,
  type Profile,
  type Itinerary,
  type SearchResult,
} from "./travel";

const airports = new Set(
  "NRT HND KIX ITM CTS FUK OKA NGO SDJ HIJ KOJ KIJ TAK MYJ KMJ NGS OIT AOJ AKJ KMQ TOY MMB HKD ISG MMY UKB YGJ OKJ KCZ IWK KMI HSG GAJ AXT OBO KUH".split(
    " ",
  ),
);
export function safeLink(value: unknown, fallback: string) {
  try {
    const u = new URL(String(value));
    if (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      u.hostname.includes(".") &&
      !/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname) &&
      !u.hostname.endsWith(".local") &&
      !u.searchParams.has("api_key")
    )
      return u.toString();
  } catch {
    /* A missing source URL falls back to a normal public search. */
  }
  return fallback;
}
const positive = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v > 0 && v < 100000000;
type Raw = Record<string, any>; // Provider JSON is narrowed at each field before displaying it.
export function liteOffers(
  data: Raw,
  fallback: string,
  sandbox: boolean,
): SearchResult["offers"] {
  const hotels = new Map<string, Raw>(
    (Array.isArray(data.hotels) ? data.hotels : []).map((h: Raw) => [h.id, h]),
  );
  return (Array.isArray(data.data) ? data.data : [])
    .slice(0, 5)
    .flatMap((h: Raw) => {
      const room = h.roomTypes?.[0],
        total = room?.offerRetailRate;
      const hotel = hotels.get(h.hotelId);
      if (
        !hotel ||
        typeof hotel.name !== "string" ||
        !positive(total?.amount) ||
        total.currency !== "INR"
      )
        return [];
      const extras = (Array.isArray(room.rates) ? room.rates : [])
        .flatMap((r: Raw) =>
          Array.isArray(r.retailRate?.taxesAndFees)
            ? r.retailRate.taxesAndFees
            : [],
        )
        .filter((t: Raw) => t.included === false);
      return [
        {
          name: hotel.name.slice(0, 200),
          priceINR: total.amount,
          basis: sandbox
            ? "Sandbox test amount for this stay · not a real offer"
            : "Supplier-returned amount for the requested stay · 1 room",
          taxes: extras.length
            ? "Additional excluded taxes or fees are reported. Confirm the full payable total with the provider."
            : "Review supplier tax details and local charges before booking; no reservation was made.",
          url: fallback,
          imageUrl:
            safeHotelImage(hotel.main_photo) ??
            safeHotelImage(hotel.thumbnail) ??
            safeHotelImage(hotel.image) ??
            safeHotelImage(hotel.images?.[0]?.url) ??
            safeHotelImage(hotel.images?.[0]),
        },
      ];
    });
}
async function searchLite(
  profile: Profile,
  stay: Itinerary["stays"][number],
  missing: string,
  fetcher: typeof fetch,
): Promise<SearchResult> {
  const key = process.env.LITEAPI_KEY;
  const result: SearchResult = {
    kind: "hotel",
    title: `LiteAPI · ${stay.city}`,
    scope: `${stay.checkIn || "Check-in undecided"}–${stay.checkOut || "Check-out undecided"} · ${profile.adults} adults · ${profile.childrenAges.length} children · 1 room`,
    status: "needs-details",
    checkedAt: new Date().toISOString(),
    note: missing,
    offers: [],
  };
  if (missing) return result;
  if (!/^[A-Z]{2}$/.test(profile.nationality))
    return {
      ...result,
      note: "Confirm the guest nationality (country only) for supplier-specific hotel rates. It is not inferred from your departure city.",
    };
  if (!key)
    return {
      ...result,
      status: "not-connected",
      note: "The direct hotel-rate source is not connected.",
    };
  try {
    const response = await fetcher(
      "https://api.liteapi.travel/v3.0/hotels/rates",
      {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", "X-API-Key": key },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          countryCode: "JP",
          cityName: stay.city,
          checkin: stay.checkIn,
          checkout: stay.checkOut,
          currency: "INR",
          guestNationality: profile.nationality,
          occupancies: [
            {
              adults: profile.adults,
              ...(profile.childrenAges.length
                ? { children: profile.childrenAges }
                : {}),
            },
          ],
          limit: 5,
          maxRatesPerHotel: 1,
          includeHotelData: true,
          timeout: 6,
        }),
      },
    );
    if (response.status === 204)
      return {
        ...result,
        status: "unavailable",
        note: "The supplier returned no rates. This does not establish that the destination is sold out.",
      };
    if (!response.ok) throw new Error();
    const data: Raw = await response.json();
    if (data.error || !Array.isArray(data.data)) throw new Error();
    const sandbox = key.startsWith("sand_") || data.sandbox !== false;
    result.offers = liteOffers(
      data,
      `https://www.google.com/travel/hotels?q=${encodeURIComponent(stay.city + " Japan hotels")}&gl=IN&curr=INR`,
      sandbox,
    );
    result.status = sandbox
      ? "test"
      : result.offers.length
        ? "found"
        : "unavailable";
    result.note = sandbox
      ? "LiteAPI sandbox response. These amounts are simulated test data, not real prices or availability. They are excluded from planning and live-price totals."
      : "Hotel rates returned by LiteAPI for the stated dates and occupancy. This is a supplier snapshot, not a reservation. Prices and conditions require a fresh check before booking; MakeMyTrip and Agoda have not been independently checked.";
    return result;
  } catch {
    return {
      ...result,
      status: "error",
      note: "The direct hotel source couldn’t complete this search. No availability was confirmed.",
    };
  }
}
export function hotelOffers(
  data: Raw,
  fallback: string,
): SearchResult["offers"] {
  const rows = Array.isArray(data.properties)
    ? data.properties
    : data.name
      ? [data]
      : [];
  return rows.slice(0, 5).flatMap((p: Raw) => {
    const rate = p.total_rate,
      inclusive = rate?.extracted_after_taxes_fees;
    const price = positive(inclusive) ? inclusive : rate?.extracted_lowest;
    if (typeof p.name !== "string" || !positive(price)) return [];
    return [
      {
        name: p.name.slice(0, 200),
        priceINR: price,
        basis: "Displayed total for the requested stay · 1 room",
        taxes: positive(inclusive)
          ? "Includes the taxes and fees returned by the search; local charges may remain."
          : "Tax inclusion not confirmed by the search.",
        url: safeLink(p.link, fallback),
        imageUrl:
          safeHotelImage(p.images?.[0]?.original_image) ??
          safeHotelImage(p.images?.[0]?.thumbnail) ??
          safeHotelImage(p.thumbnail),
      },
    ];
  });
}
export function flightOffers(
  data: Raw,
  fallback: string,
): SearchResult["offers"] {
  const rows = [
    ...(Array.isArray(data.best_flights) ? data.best_flights : []),
    ...(Array.isArray(data.other_flights) ? data.other_flights : []),
  ];
  return rows.slice(0, 5).flatMap((r: Raw) => {
    if (!positive(r.price) || !Array.isArray(r.flights) || !r.flights.length)
      return [];
    const carriers = [
      ...new Set(
        r.flights.map((f: Raw) =>
          typeof f.airline === "string" ? f.airline : "Airline not supplied",
        ),
      ),
    ].join(" + ");
    const route = r.flights
      .map(
        (f: Raw) =>
          `${String(f.departure_airport?.id || "").slice(0, 3)}–${String(f.arrival_airport?.id || "").slice(0, 3)}`,
      )
      .join(", ");
    const departure = r.flights[0]?.departure_airport?.time;
    const arrival = r.flights.at(-1)?.arrival_airport?.time;
    const schedule =
      typeof departure === "string" && typeof arrival === "string"
        ? ` Outbound local times: ${departure.slice(0, 16)} → ${arrival.slice(0, 16)}.`
        : "";
    return [
      {
        name: `${carriers} · ${route}`.slice(0, 200),
        priceINR: r.price,
        basis: `Displayed economy return-search fare · confirm passenger total with airline.${schedule}`,
        taxes: "Baggage, fare conditions and final total need confirmation.",
        url: fallback,
      },
    ];
  });
}
export async function searchAvailability(
  profile: Profile,
  itinerary: Itinerary,
  fetcher: typeof fetch = fetch,
): Promise<SearchResult[]> {
  const key = process.env.SERPAPI_API_KEY;
  const checkedAt = new Date().toISOString();
  const today = checkedAt.slice(0, 10);
  const results: SearchResult[] = [];
  const validRange = (a: string, b: string) =>
    validDate(a) && validDate(b) && a >= today && b > a;
  async function run(
    kind: "flight" | "hotel",
    title: string,
    scope: string,
    params: Record<string, string>,
    fallback: string,
    missing: string,
  ): Promise<SearchResult> {
    const result: SearchResult = {
      kind,
      title,
      scope,
      status: "needs-details",
      checkedAt,
      note: missing,
      offers: [],
    };
    if (missing) return result;
    if (!key)
      return {
        ...result,
        status: "not-connected",
        note: "Price search isn’t connected yet. No current price or availability has been verified.",
      };
    try {
      const u = new URL("https://serpapi.com/search.json");
      Object.entries({
        ...params,
        api_key: key,
        currency: "INR",
        hl: "en",
        gl: "in",
        no_cache: "true",
      }).forEach(([k, v]) => u.searchParams.set(k, v));
      const response = await fetcher(u, {
        cache: "no-store",
        signal: AbortSignal.timeout(25000),
      });
      if (!response.ok) throw new Error("Search failed");
      const data: Raw = await response.json();
      if (
        data.error ||
        data.search_metadata?.status !== "Success" ||
        data.search_parameters?.currency !== "INR"
      )
        throw new Error("Search incomplete");
      result.offers =
        kind === "hotel"
          ? hotelOffers(data, fallback)
          : flightOffers(
              data,
              safeLink(data.search_metadata?.google_flights_url, fallback),
            );
      result.status = result.offers.length ? "found" : "unavailable";
      result.note = result.offers.length
        ? "Google Travel results via SerpApi, requested in INR for the Indian market. Search snapshot only; confirm the final price and availability with the booking provider. MakeMyTrip and Agoda have not been independently checked."
        : "This search returned no priced options. That does not establish that the route or destination is sold out.";
    } catch {
      result.status = "error";
      result.note =
        "The price source couldn’t complete this search. No availability was confirmed. Try again later.";
    }
    return result;
  }
  const party = `${profile.adults} adults${profile.childrenAges.length ? ` · children aged ${profile.childrenAges.join(", ")}` : ""}`;
  const flightMissing =
    !profile.partyConfirmed || profile.adults < 1
      ? "Confirm the adults and children traveling before checking flights."
      : !validRange(profile.startDate, profile.endDate)
        ? "Exact future departure and return dates are needed for flight prices."
        : !/^[A-Z]{3}$/.test(profile.originAirport) ||
            !airports.has(profile.arrivalAirport)
          ? "Confirm your departure airport and Japan arrival airport before checking fares."
          : profile.departureAirport &&
              profile.departureAirport !== profile.arrivalAirport
            ? "This trip uses different arrival and departure airports. Multi-city fare verification is not connected; check the complete route with an airline."
            : profile.childrenAges.some((a) => a < 2)
              ? "Infant seating needs airline confirmation before a reliable fare search."
              : "";
  results.push(
    await run(
      "flight",
      "Flights to Japan",
      `${profile.originAirport || "Origin undecided"} → ${profile.arrivalAirport || "Japan airport undecided"} · ${profile.startDate || "Dates undecided"}–${profile.endDate || ""} · ${party}`,
      {
        engine: "google_flights",
        departure_id: profile.originAirport,
        arrival_id: profile.arrivalAirport,
        outbound_date: profile.startDate,
        return_date: profile.endDate,
        type: "1",
        travel_class: "1",
        adults: String(
          profile.adults + profile.childrenAges.filter((a) => a >= 12).length,
        ),
        children: String(
          profile.childrenAges.filter((a) => a >= 2 && a < 12).length,
        ),
      },
      "https://www.google.com/travel/flights?gl=IN&curr=INR&hl=en",
      flightMissing,
    ),
  );
  // Limit one explicit check to four bases plus the flight search, rather than exhausting a free quota.
  const hotelGroups = await Promise.all(
    itinerary.stays.slice(0, 4).map(async (stay) => {
      const missing =
        !profile.partyConfirmed || profile.adults < 1
          ? "Confirm the traveling party before checking hotel occupancy."
          : profile.rooms !== 1
            ? "Confirm a single-room arrangement for this search. Multi-room prices need a booking-provider check."
            : !validRange(stay.checkIn, stay.checkOut) ||
                !validRange(profile.startDate, profile.endDate) ||
                stay.checkIn < profile.startDate ||
                stay.checkOut > profile.endDate
              ? "Exact check-in and check-out dates within your confirmed trip are needed."
              : "";
      const hotel = await run(
        "hotel",
        `Stays in ${stay.city}`,
        `${stay.checkIn || "Check-in undecided"}–${stay.checkOut || "Check-out undecided"} · ${party} · ${profile.rooms || "?"} room(s)`,
        {
          engine: "google_hotels",
          q: `${stay.city} Japan hotels`,
          check_in_date: stay.checkIn,
          check_out_date: stay.checkOut,
          adults: String(profile.adults),
          children: String(profile.childrenAges.length),
          ...(profile.childrenAges.length
            ? {
                children_ages: profile.childrenAges
                  .map((a) => Math.max(1, a))
                  .join(","),
              }
            : {}),
        },
        `https://www.google.com/travel/hotels?q=${encodeURIComponent(stay.city + " Japan hotels")}&gl=IN&curr=INR`,
        missing,
      );
      return process.env.LITEAPI_KEY
        ? [hotel, await searchLite(profile, stay, missing, fetcher)]
        : [hotel];
    }),
  );
  results.push(...hotelGroups.flat());
  if (!itinerary.stays.length || itinerary.stays.length > 4)
    results.push({
      kind: "hotel",
      title: "Other stays",
      scope: "Itinerary coverage",
      status: "needs-details",
      checkedAt,
      offers: [],
      note: !itinerary.stays.length
        ? "No dated overnight stays were specified. Ask the planner to refine your overnight bases."
        : "Only the first four overnight bases were searched in this check. Remaining bases have not been checked.",
    });
  return results;
}
