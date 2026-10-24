import assert from "node:assert/strict";
import test from "node:test";
import { buildTripPdf, pdfText } from "../src/lib/trip-pdf";
import { emptySession, type TravelSession } from "../src/lib/travel";

export function samplePdfSession(): TravelSession {
  return {
    ...emptySession(),
    itinerary: {
      title: "A thoughtful week in Japan",
      summary: "A vegetarian family journey through Tokyo and Kyoto.",
      days: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        date: `2027-04-${String(i + 1).padStart(2, "0")}`,
        place: i < 3 ? "Tokyo" : "Kyoto",
        morning: "Explore the neighborhood at your own pace. ".repeat(12),
        afternoon: "Discover a museum and a garden with time for a break.",
        evening: "Watch the sunset, then enjoy dinner nearby.",
        transport:
          "Confirm exact stations and journey times in the rail atlas.",
        food: "Vegetarian restaurants; confirm dashi and cross-contact directly.",
        stayCity: i < 3 ? "Tokyo" : "Kyoto",
        notes:
          "Book popular attractions in advance, with a flexible rain alternative.",
      })),
      stays: [{ city: "Tokyo", checkIn: "2027-04-01", checkOut: "2027-04-04" }],
      budget: [
        {
          label: "Hotel estimate",
          lowINR: 60000,
          highINR: 90000,
          basis: "One room for the family, six nights; taxes not confirmed",
        },
      ],
      unresolved: ["Confirm child occupancy."],
    },
    searches: [
      {
        kind: "hotel",
        title: "Tokyo family hotels",
        status: "test",
        scope: "One room, 2 adults",
        checkedAt: "2026-10-24T10:00:00Z",
        note: "Sandbox example only",
        offers: [
          {
            name: "Example hotel",
            priceINR: 12000,
            basis: "per room per night",
            taxes: "Taxes excluded",
            url: "https://example.com/" + "booking-details/".repeat(15),
          },
        ],
      },
    ],
  };
}

test("trip PDF preserves detailed itinerary and clearly separates prices from estimates", () => {
  const pdf = new TextDecoder().decode(buildTripPdf(samplePdfSession()));
  for (const text of [
    "%PDF-1.4",
    "Day 7",
    "Morning:",
    "Afternoon:",
    "Evening:",
    "Getting around:",
    "Food and dietary planning:",
    "Overnight base:",
    "Checks before booking",
    "TEST / SANDBOX",
    "Source URL:",
    "Taxes excluded",
    "2026-10-24T10:00:00Z",
    "INR 60,000",
    "Price basis:",
    "AI estimates",
  ])
    assert.ok(pdf.includes(text), text);
  const count = Number(pdf.match(/\/Type \/Pages \/Count (\d+)/)?.[1]);
  assert.ok(count >= 4, "long itinerary must paginate");
  const xref = Number(pdf.match(/startxref\n(\d+)/)?.[1]);
  assert.equal(pdf.slice(xref, xref + 4), "xref");
  for (const match of pdf.matchAll(/(\d{10}) 00000 n/g)) {
    assert.match(
      pdf.slice(Number(match[1]), Number(match[1]) + 15),
      /^\d+ 0 obj/,
    );
  }
});

test("PDF handles currency, punctuation, Unicode and escaping without invalid bytes", () => {
  assert.equal(pdfText("₹1,000 — café → Tokyo"), "INR 1,000 - cafe  to  Tokyo");
  assert.equal(pdfText("東京"), "Tokyo");
  assert.equal(pdfText("Kyoto‑Tokyo\u00a0trip"), "Kyoto-Tokyo trip");
  const session = samplePdfSession();
  session.itinerary!.title = "Tokyo (family) \\ Japan ₹1,000 東京";
  const pdf = new TextDecoder().decode(buildTripPdf(session));
  assert.ok(pdf.includes("\\(family\\) \\\\ Japan INR 1,000"));
  assert.match(pdf, /^[\x00-\x7f]*$/);
});

test("PDF refuses empty plans and visibly flags an outdated itinerary", () => {
  assert.throws(() => buildTripPdf(emptySession()), /Generate your itinerary/);
  const session = samplePdfSession();
  session.needsRevision = true;
  assert.ok(
    new TextDecoder()
      .decode(buildTripPdf(session))
      .includes("REVISION NEEDED:"),
  );
});

test("PDF adds chosen preferences and a group subtotal without adding source offers", () => {
  const session = samplePdfSession();
  session.messages = [
    { role: "user", content: "Vegetarian food and quiet gardens" },
    { role: "user", content: "Show different choices for this question." },
  ];
  session.itinerary!.budget.push({
    label: "Museum tickets",
    lowINR: 1000,
    highINR: 2000,
    basis: "per person; group size not confirmed",
  });
  const pdf = new TextDecoder().decode(buildTripPdf(session));
  assert.ok(pdf.includes("Estimated group subtotal: INR 60,000 - INR 90,000"));
  assert.ok(pdf.includes("Your planning choices"));
  assert.ok(pdf.includes("Vegetarian food and quiet gardens"));
  assert.ok(!pdf.includes("Show different choices for this question."));
  assert.ok(pdf.includes("excluded from the group subtotal"));
});
