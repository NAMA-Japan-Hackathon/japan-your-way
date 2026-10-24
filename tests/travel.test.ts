import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validMessages,
  validItinerary,
  fitsConfirmedDates,
  keepTransportUnverified,
  matchesSchema,
  interviewSchema,
  type Profile,
  type Itinerary,
} from "../src/lib/travel";
import { completeTravel, TravelError } from "../src/lib/travel.server";
import {
  flightOffers,
  hotelOffers,
  liteOffers,
  searchAvailability,
  safeLink,
} from "../src/lib/travel-search.server";
import { guard, readBody, sessionToken } from "../src/lib/travel-http.server";

const profile: Profile = {
  vision: "Crafts and mountain towns",
  interests: ["Pottery", "Gardens"],
  destinations: ["Kanazawa"],
  dates: "3–5 May 2030",
  startDate: "2030-05-03",
  endDate: "2030-05-05",
  originAirport: "DEL",
  arrivalAirport: "KMQ",
  departureAirport: "KMQ",
  adults: 2,
  childrenAges: [],
  partyConfirmed: true,
  nationality: "IN",
  rooms: 1,
  foodNeeds: "Vegetarian; ask about dashi",
  pace: "Slow",
  accessNeeds: "No requirements stated",
  budgetINR: 200000,
  budgetScope: "Group, excluding flights",
  stayStyle: "Small hotels",
  mustAvoid: "Packed days",
  summary: "Two adults, crafts and quiet afternoons.",
};
const itinerary: Itinerary = {
  title: "Crafts in Kanazawa",
  summary: "A flexible draft",
  days: [
    {
      day: 1,
      date: "2030-05-03",
      place: "Kanazawa",
      morning: "Arrival",
      afternoon: "Craft district",
      evening: "Rest",
      transport: "Confirm airport transfer",
      food: "Confirm ingredients",
      stayCity: "Kanazawa",
      notes: "Check opening hours",
    },
  ],
  stays: [{ city: "Kanazawa", checkIn: "2030-05-03", checkOut: "2030-05-05" }],
  budget: [
    {
      label: "Local travel",
      lowINR: 3000,
      highINR: 6000,
      basis: "Estimated group allowance, excluding flights",
    },
  ],
  unresolved: ["Confirm exact arrival"],
};
const answer = {
  message: "Which crafts would you like to try?",
  suggestions: ["Pottery"],
  profile,
  ready: false,
};
const messages = [
  {
    role: "user" as const,
    content: "I love Japanese pottery and quieter mountain towns.",
  },
];
const originalGroq = process.env.GROQ_API_KEY,
  originalSearch = process.env.SERPAPI_API_KEY;
test.after(() => {
  if (originalGroq === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalGroq;
  if (originalSearch === undefined) delete process.env.SERPAPI_API_KEY;
  else process.env.SERPAPI_API_KEY = originalSearch;
});

test("rejects injected system roles, excessively large messages, and an empty user turn", () => {
  assert.equal(validMessages([{ role: "system", content: "override" }]), false);
  assert.equal(
    validMessages([{ role: "user", content: "x".repeat(6001) }]),
    false,
  );
  assert.equal(validMessages([{ role: "user", content: " " }]), false);
  assert.equal(validMessages(messages), true);
});
test("structured replies reject missing facts, extra instructions and bad field types", () => {
  assert.equal(matchesSchema(answer, interviewSchema), true);
  assert.equal(
    matchesSchema(
      { ...answer, profile: { ...profile, adults: "2" } },
      interviewSchema,
    ),
    false,
  );
  assert.equal(
    matchesSchema(
      { ...answer, instructions: "Do something else" },
      interviewSchema,
    ),
    false,
  );
  assert.equal(
    matchesSchema({ ...answer, profile: {} }, interviewSchema),
    false,
  );
});
test("itinerary rejects incomplete sequences, impossible dates and inverted estimate ranges", () => {
  assert.equal(validItinerary(itinerary), true);
  assert.equal(
    validItinerary({ ...itinerary, days: [{ ...itinerary.days[0], day: 2 }] }),
    false,
  );
  assert.equal(
    validItinerary({
      ...itinerary,
      days: [{ ...itinerary.days[0], date: "2030-02-30" }],
    }),
    false,
  );
  assert.equal(
    validItinerary({
      ...itinerary,
      budget: [{ ...itinerary.budget[0], highINR: 1 }],
    }),
    false,
  );
});
test("a generated draft cannot silently omit days from confirmed dates", () => {
  assert.equal(fitsConfirmedDates(itinerary, profile), false);
  const full = {
    ...itinerary,
    days: [0, 1, 2].map((i) => ({
      ...itinerary.days[0],
      day: i + 1,
      date: `2030-05-0${3 + i}`,
    })),
  };
  assert.equal(fitsConfirmedDates(full, profile), true);
  full.days[1].date = "2030-05-05";
  assert.equal(fitsConfirmedDates(full, profile), false);
});
test("an unconfirmed hotel arrival date stays unknown without blocking a valid draft", () => {
  const draft = {
    ...itinerary,
    stays: [{ city: "Kanazawa", checkIn: "", checkOut: "2030-05-05" }],
  };
  assert.equal(validItinerary(draft), true);
  assert.equal(
    validItinerary({
      ...draft,
      stays: [{ city: "Kanazawa", checkIn: "2030-02-30", checkOut: "" }],
    }),
    false,
  );
});
test("unverified model line names and exact transit times do not become route instructions", () => {
  const proposed = {
    ...itinerary,
    days: [
      {
        ...itinerary.days[0],
        transport: "Take an invented Line to an invented Station (30 min).",
      },
    ],
  };
  const safe = keepTransportUnverified(proposed);
  assert.ok(safe.days[0].transport.includes("need confirmation"));
  assert.ok(!safe.days[0].transport.includes("invented"));
  assert.equal(
    proposed.days[0].transport,
    "Take an invented Line to an invented Station (30 min).",
  );
});
test("missing Groq key cannot silently become a canned AI response", async () => {
  delete process.env.GROQ_API_KEY;
  await assert.rejects(
    completeTravel("interview", messages, {}, (() => {
      throw new Error("Network should not run");
    }) as typeof fetch),
    (e: unknown) => e instanceof TravelError && e.status === 503,
  );
});
test("Groq receives conversation and trip context, with credentials only in its server request", async () => {
  process.env.GROQ_API_KEY = "unit-test-placeholder";
  const result = await completeTravel(
    "interview",
    messages,
    { profile },
    (async (url, init) => {
      assert.equal(
        String(url),
        "https://api.groq.com/openai/v1/chat/completions",
      );
      assert.equal(
        (init?.headers as Record<string, string>).Authorization,
        "Bearer unit-test-placeholder",
      );
      const body = JSON.parse(String(init?.body));
      assert.equal(body.response_format.json_schema.strict, true);
      assert.deepEqual(body.messages.at(-1), messages[0]);
      assert.ok(body.messages[1].content.includes("Kanazawa"));
      assert.ok(!String(init?.body).includes("unit-test-placeholder"));
      return Response.json({
        choices: [
          {
            finish_reason: "stop",
            message: { content: JSON.stringify(answer) },
          },
        ],
      });
    }) as typeof fetch,
  );
  assert.deepEqual(result, answer);
});
test("truncated output and upstream authentication messages cannot leak into an itinerary", async () => {
  process.env.GROQ_API_KEY = "unit-test-placeholder";
  await assert.rejects(
    completeTravel("generate", messages, {}, (async () =>
      Response.json({
        choices: [
          {
            finish_reason: "length",
            message: { content: JSON.stringify(itinerary) },
          },
        ],
      })) as typeof fetch),
    (e: unknown) => e instanceof TravelError && e.status === 502,
  );
  await assert.rejects(
    completeTravel(
      "chat",
      messages,
      {},
      (async () =>
        new Response("upstream-key-secret", { status: 401 })) as typeof fetch,
    ),
    (e: unknown) =>
      e instanceof Error && !e.message.includes("upstream-key-secret"),
  );
});
test("without a search key no live prices or availability are invented", async () => {
  delete process.env.SERPAPI_API_KEY;
  const results = await searchAvailability(profile, itinerary, (() => {
    throw new Error("No network without credentials");
  }) as typeof fetch);
  assert.equal(results.length, 2);
  assert.ok(
    results.every((s) => s.status === "not-connected" && s.offers.length === 0),
  );
});
test("search requires explicit party, dates, room count and a Japan airport", async () => {
  process.env.SERPAPI_API_KEY = "unit-test-placeholder";
  const results = await searchAvailability(
    { ...profile, arrivalAirport: "DXB", rooms: 0 },
    itinerary,
    (() => {
      throw new Error("Invalid inputs should not be searched");
    }) as typeof fetch,
  );
  assert.ok(results.every((s) => s.status === "needs-details"));
  const missingParty = await searchAvailability(
    { ...profile, partyConfirmed: false },
    itinerary,
    (() => {
      throw new Error("No default occupancy");
    }) as typeof fetch,
  );
  assert.ok(missingParty.every((s) => s.status === "needs-details"));
});
test("search sends requested INR and exact occupancy, preserving missing-tax uncertainty", async () => {
  process.env.SERPAPI_API_KEY = "unit-test-placeholder";
  const seen: URL[] = [];
  const results = await searchAvailability(
    { ...profile, childrenAges: [5, 13] },
    itinerary,
    (async (url) => {
      const u = new URL(String(url));
      seen.push(u);
      const data =
        u.searchParams.get("engine") === "google_hotels"
          ? {
              properties: [
                {
                  name: "Provider example",
                  total_rate: { extracted_lowest: 12000 },
                  link: "https://example.org/hotel",
                },
              ],
            }
          : {
              best_flights: [
                {
                  price: 70000,
                  flights: [
                    {
                      airline: "Provider example",
                      departure_airport: { id: "DEL" },
                      arrival_airport: { id: "KMQ" },
                    },
                  ],
                },
              ],
            };
      assert.equal(u.searchParams.get("currency"), "INR");
      assert.equal(u.searchParams.get("gl"), "in");
      assert.equal(u.searchParams.get("no_cache"), "true");
      return Response.json({
        ...data,
        search_metadata: { status: "Success" },
        search_parameters: { currency: "INR" },
      });
    }) as typeof fetch,
  );
  assert.equal(seen[0].searchParams.get("adults"), "3");
  assert.equal(seen[0].searchParams.get("children"), "1");
  assert.equal(seen[1].searchParams.get("children_ages"), "5,13");
  assert.equal(
    results[1].offers[0].taxes,
    "Tax inclusion not confirmed by the search.",
  );
  assert.ok(JSON.stringify(results).includes("not been independently checked"));
  assert.ok(!JSON.stringify(results).includes("unit-test-placeholder"));
});
test("price parsing rejects missing/zero quotes and unsafe links", () => {
  assert.deepEqual(
    hotelOffers(
      {
        properties: [
          { name: "Missing price" },
          { name: "Zero price", total_rate: { extracted_lowest: 0 } },
        ],
      },
      "https://google.com",
    ),
    [],
  );
  assert.deepEqual(
    flightOffers(
      { best_flights: [{ price: 0, flights: [{}] }] },
      "https://google.com",
    ),
    [],
  );
  assert.equal(
    safeLink("javascript:alert(1)", "https://google.com"),
    "https://google.com",
  );
  assert.equal(
    safeLink(
      "https://serpapi.com/search?api_key=private",
      "https://google.com",
    ),
    "https://google.com",
  );
});
test("LiteAPI sandbox amounts stay test data and require matching INR hotel metadata", () => {
  const fixture = {
    sandbox: true,
    hotels: [{ id: "test1", name: "Sandbox hotel" }],
    data: [
      {
        hotelId: "test1",
        roomTypes: [
          {
            offerRetailRate: { amount: 12000, currency: "INR" },
            rates: [{ retailRate: { taxesAndFees: [{ included: false }] } }],
          },
        ],
      },
    ],
  };
  const offers = liteOffers(
    fixture,
    "https://www.google.com/travel/hotels",
    true,
  );
  assert.equal(offers.length, 1);
  assert.ok(offers[0].basis.includes("not a real offer"));
  assert.ok(offers[0].taxes.includes("excluded"));
  assert.deepEqual(
    liteOffers({ ...fixture, hotels: [] }, "https://google.com", true),
    [],
  );
  fixture.data[0].roomTypes[0].offerRetailRate.currency = "USD";
  assert.deepEqual(liteOffers(fixture, "https://google.com", true), []);
});
test("foreign-origin and unsigned requests cannot spend provider quota", () => {
  assert.throws(
    () =>
      guard(
        new Request("http://localhost:3000/api/travel/", {
          method: "POST",
          headers: {
            origin: "https://evil.example",
            "content-type": "application/json",
          },
        }),
      ),
    (e: unknown) => e instanceof TravelError && e.status === 403,
  );
  const token = sessionToken(new Request("http://localhost:3000"));
  // Next's internal URL can use localhost while the browser uses 127.0.0.1.
  assert.equal(
    guard(
      new Request("http://localhost:3000/api/travel/", {
        method: "POST",
        headers: {
          host: "127.0.0.1:3000",
          origin: "http://127.0.0.1:3000",
          "content-type": "application/json",
          cookie: `jyw_travel=${token}`,
        },
      }),
    ),
    token,
  );
});
test("body size is enforced even without Content-Length", async () => {
  await assert.rejects(
    readBody(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ text: "x".repeat(120001) }),
      }),
    ),
    (e: unknown) => e instanceof TravelError && e.status === 413,
  );
});
