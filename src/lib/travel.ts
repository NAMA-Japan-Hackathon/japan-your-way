// Shared contracts contain no credentials or provider implementation.
export type Message = { role: "user" | "assistant"; content: string };
export type Profile = {
  vision: string;
  interests: string[];
  destinations: string[];
  dates: string;
  startDate: string;
  endDate: string;
  originAirport: string;
  arrivalAirport: string;
  departureAirport: string;
  adults: number;
  childrenAges: number[];
  partyConfirmed: boolean;
  nationality: string;
  rooms: number;
  foodNeeds: string;
  pace: string;
  accessNeeds: string;
  budgetINR: number;
  budgetScope: string;
  stayStyle: string;
  mustAvoid: string;
  summary: string;
};
export type Interview = {
  message: string;
  suggestions: string[];
  profile: Profile;
  ready: boolean;
};
export type Itinerary = {
  title: string;
  summary: string;
  days: {
    day: number;
    date: string;
    place: string;
    morning: string;
    afternoon: string;
    evening: string;
    transport: string;
    food: string;
    stayCity: string;
    notes: string;
  }[];
  stays: { city: string; checkIn: string; checkOut: string }[];
  budget: { label: string; lowINR: number; highINR: number; basis: string }[];
  unresolved: string[];
};
export type SearchResult = {
  kind: "flight" | "hotel";
  title: string;
  scope: string;
  status:
    | "found"
    | "test"
    | "unavailable"
    | "needs-details"
    | "not-connected"
    | "error";
  checkedAt: string;
  note: string;
  offers: {
    name: string;
    priceINR: number;
    basis: string;
    taxes: string;
    url: string;
  }[];
};
export type TravelSession = {
  version: 1;
  id: string;
  messages: Message[];
  chat: Message[];
  interview: Interview | null;
  itinerary: Itinerary | null;
  searches: SearchResult[];
  needsRevision: boolean;
};
export function validSearches(value: unknown): value is SearchResult[] {
  const bounded = (v: unknown, max: number): v is string =>
    typeof v === "string" && v.length <= max;
  return (
    Array.isArray(value) &&
    value.length <= 10 &&
    value.every(
      (r) =>
        r &&
        ["flight", "hotel"].includes(r.kind) &&
        bounded(r.title, 300) &&
        bounded(r.scope, 1000) &&
        bounded(r.note, 3000) &&
        [
          "found",
          "test",
          "unavailable",
          "needs-details",
          "not-connected",
          "error",
        ].includes(r.status) &&
        bounded(r.checkedAt, 40) &&
        Number.isFinite(Date.parse(r.checkedAt)) &&
        Array.isArray(r.offers) &&
        r.offers.length <= 5 &&
        r.offers.every(
          (o: SearchResult["offers"][number]) =>
            o &&
            bounded(o.name, 300) &&
            typeof o.priceINR === "number" &&
            Number.isFinite(o.priceINR) &&
            o.priceINR > 0 &&
            o.priceINR < 100000000 &&
            bounded(o.basis, 1000) &&
            bounded(o.taxes, 2000) &&
            bounded(o.url, 5000) &&
            /^https:\/\//.test(o.url),
        ),
    )
  );
}
export const OPENING =
  "When you picture a wonderful trip to Japan, what are you doing — and who’s there with you?";
export const SESSION_KEY = "jyw-ai-session-v1";
export const SAVED_AI_KEY = "jyw-ai-saved-v1";
export const emptySession = (): TravelSession => ({
  version: 1,
  id: "",
  messages: [],
  chat: [],
  interview: null,
  itinerary: null,
  searches: [],
  needsRevision: false,
});
export const profileRows = (p: Profile) =>
  [
    ["Your kind of trip", p.vision],
    ["Drawn to", p.interests.join(", ")],
    ["Places", p.destinations.join(", ")],
    ["When", p.dates],
    [
      "Traveling with",
      p.partyConfirmed
        ? `${p.adults} adult${p.adults === 1 ? "" : "s"}${p.childrenAges.length ? ` · children aged ${p.childrenAges.join(", ")}` : ""}`
        : "",
    ],
    [
      "Budget",
      p.budgetINR ? `${inr(p.budgetINR)} · ${p.budgetScope}` : p.budgetScope,
    ],
    ["Pace", p.pace],
    ["Food", p.foodNeeds],
    ["Access", p.accessNeeds],
    ["Stays", p.stayStyle],
    ["Avoid", p.mustAvoid],
  ].filter(([, v]) => Boolean(v));
export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export type Schema = {
  type?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  additionalProperties?: boolean;
  enum?: unknown[];
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
};
const str = (max = 1600): Schema => ({ type: "string", maxLength: max });
const num = (max: number): Schema => ({
  type: "integer",
  minimum: 0,
  maximum: max,
});
const arr = (items: Schema, max = 20): Schema => ({
  type: "array",
  items,
  maxItems: max,
});
const obj = (properties: Record<string, Schema>): Schema => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
export const profileSchema = obj({
  vision: str(),
  interests: arr(str(150)),
  destinations: arr(str(150)),
  dates: str(300),
  startDate: str(10),
  endDate: str(10),
  originAirport: str(3),
  arrivalAirport: str(3),
  departureAirport: str(3),
  adults: num(9),
  childrenAges: arr(num(17), 8),
  partyConfirmed: { type: "boolean" },
  nationality: str(2),
  rooms: num(8),
  foodNeeds: str(),
  pace: str(300),
  accessNeeds: str(),
  budgetINR: num(100000000),
  budgetScope: str(300),
  stayStyle: str(500),
  mustAvoid: str(),
  summary: str(2500),
});
export const interviewSchema = obj({
  message: { ...str(3000), minLength: 1 },
  suggestions: arr(str(160), 4),
  profile: profileSchema,
  ready: { type: "boolean" },
});
export const chatSchema = obj({
  message: { ...str(6000), minLength: 1 },
  suggestions: arr(str(160), 4),
});
export const itinerarySchema = obj({
  title: str(160),
  summary: str(3000),
  days: {
    ...arr(
      obj({
        day: { ...num(60), minimum: 1 },
        date: str(10),
        place: str(180),
        morning: str(),
        afternoon: str(),
        evening: str(),
        transport: str(),
        food: str(),
        stayCity: str(180),
        notes: str(),
      }),
      60,
    ),
    minItems: 1,
  },
  stays: arr(obj({ city: str(180), checkIn: str(10), checkOut: str(10) }), 30),
  budget: arr(
    obj({
      label: str(200),
      lowINR: num(100000000),
      highINR: num(100000000),
      basis: str(800),
    }),
    15,
  ),
  unresolved: arr(str(800), 30),
});
export function matchesSchema(value: unknown, schema: Schema): boolean {
  if (schema.enum && !schema.enum.includes(value)) return false;
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    const v = value as Record<string, unknown>,
      fields = schema.properties || {};
    return (
      (schema.required || []).every((k) => k in v) &&
      Object.keys(v).every((k) => k in fields && matchesSchema(v[k], fields[k]))
    );
  }
  if (schema.type === "array")
    return (
      Array.isArray(value) &&
      value.length >= (schema.minItems || 0) &&
      value.length <= (schema.maxItems ?? Infinity) &&
      value.every((x) => matchesSchema(x, schema.items!))
    );
  if (schema.type === "string")
    return (
      typeof value === "string" &&
      value.length >= (schema.minLength || 0) &&
      value.length <= (schema.maxLength ?? Infinity)
    );
  if (schema.type === "integer")
    return (
      typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= (schema.minimum ?? -Infinity) &&
      value <= (schema.maximum ?? Infinity)
    );
  return schema.type === "boolean" && typeof value === "boolean";
}
export function validMessages(value: unknown): value is Message[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 80 &&
    value.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        m.content.length <= 6000,
    ) &&
    value.reduce((n, m) => n + m.content.length, 0) <= 65000 &&
    value.at(-1)?.role === "user"
  );
}
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function validItinerary(value: unknown): value is Itinerary {
  if (!matchesSchema(value, itinerarySchema)) return false;
  const p = value as Itinerary;
  return (
    p.days.every((d, i) => d.day === i + 1 && (!d.date || validDate(d.date))) &&
    p.budget.every((b) => b.highINR >= b.lowINR) &&
    p.stays.every(
      (s) =>
        (!s.checkIn || validDate(s.checkIn)) &&
        (!s.checkOut || validDate(s.checkOut)) &&
        (!s.checkIn || !s.checkOut || s.checkOut > s.checkIn),
    )
  );
}
export function fitsConfirmedDates(plan: Itinerary, profile: Profile | null) {
  if (!profile || !validDate(profile.startDate) || !validDate(profile.endDate))
    return true;
  const start = Date.parse(profile.startDate),
    end = Date.parse(profile.endDate);
  const count = Math.round((end - start) / 86400000) + 1;
  return (
    count > 0 &&
    plan.days.length === count &&
    plan.days.every(
      (d, i) =>
        d.date === new Date(start + i * 86400000).toISOString().slice(0, 10),
    ) &&
    plan.stays.every(
      (s) =>
        (!s.checkIn || s.checkIn >= profile.startDate) &&
        (!s.checkOut || s.checkOut <= profile.endDate),
    )
  );
}
export function keepTransportUnverified(plan: Itinerary): Itinerary {
  return {
    ...plan,
    days: plan.days.map((d) => ({
      ...d,
      transport: /\b(?:line|station|express)\b|\d\s*(?:min|hours?|h)\b/i.test(
        d.transport,
      )
        ? `Local transport around ${d.place}. Exact stations, transfers and journey times need confirmation in the rail atlas or an operator’s journey planner.`
        : d.transport,
    })),
  };
}
