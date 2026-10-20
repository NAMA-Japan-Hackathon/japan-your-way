export type Fit = "Fits" | "Needs check" | "Conflict";
export type City = "Tokyo" | "Kyoto" | "Osaka";
export type Preferences = {
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  interests: string[];
  pace: "Relaxed" | "Balanced" | "Active";
  diet: string;
  ingredients: string;
  strictDiet: boolean;
  stepFree: boolean;
  budget: number;
  strictBudget: boolean;
};
export type Experience = {
  id: string;
  title: string;
  city: City;
  kind: "visit" | "meal";
  minutes: number;
  adult: number | null;
  child: number | null;
  interests: string[];
  zone: string;
  opens: number;
  closes: number;
  months?: number[];
  indoor?: boolean;
  diets: string[];
  stepFree: boolean | null;
  note: string;
};
export type Item = {
  id: string;
  experienceId?: string;
  title: string;
  kind: "visit" | "meal" | "travel" | "break";
  start: number;
  duration: number;
  cost: number | null;
  locked?: boolean;
  fit: Fit;
  reasons: string[];
};
export type Day = { date: string; city: City; items: Item[] };
export type Plan = {
  id: string;
  schema: 1;
  catalogue: "demo-1";
  name: string;
  preferences: Preferences;
  days: Day[];
  createdAt: string;
  updatedAt: string;
};
export type Check = {
  id: string;
  state: Fit;
  title: string;
  reason: string;
  day?: number;
};
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const time = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export const duration = (n: number) =>
  `${Math.floor(n / 60) ? `${Math.floor(n / 60)}h ` : ""}${n % 60 ? `${n % 60}m` : ""}`.trim() ||
  "0m";
export const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00+09:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Tokyo",
  });
export const defaultPreferences: Preferences = {
  arrival: "2026-11-10",
  departure: "2026-11-16",
  adults: 2,
  children: 0,
  interests: ["Culture", "Nature"],
  pace: "Relaxed",
  diet: "Vegetarian",
  ingredients: "Fish stock",
  strictDiet: true,
  stepFree: false,
  budget: 180000,
  strictBudget: false,
};
const raw: Array<
  [
    string,
    string,
    City,
    string,
    number,
    number | null,
    number | null,
    string[],
    string,
    boolean,
    boolean | null,
    string[],
    string,
  ]
> = [
  [
    "asakusa",
    "Asakusa neighborhood walk",
    "Tokyo",
    "visit",
    90,
    0,
    0,
    ["Culture"],
    "east",
    false,
    true,
    [],
    "A gentle introduction to the neighborhood. Timings and access are sample assumptions.",
  ],
  [
    "ueno",
    "Ueno park and museums",
    "Tokyo",
    "visit",
    100,
    1400,
    700,
    ["Culture", "Nature"],
    "east",
    true,
    true,
    [],
    "Choose a museum if the weather turns. Entry prices need confirmation.",
  ],
  [
    "garden",
    "A garden afternoon",
    "Tokyo",
    "visit",
    80,
    500,
    250,
    ["Nature"],
    "central",
    false,
    null,
    [],
    "Seasonal color varies. Step-free access has not been checked.",
  ],
  [
    "anime",
    "Akihabara exploration",
    "Tokyo",
    "visit",
    90,
    800,
    400,
    ["Anime", "Shopping"],
    "east",
    true,
    true,
    [],
    "A flexible shop-and-explore block; purchases are excluded.",
  ],
  [
    "craft",
    "Small-group craft workshop",
    "Tokyo",
    "visit",
    90,
    4200,
    2100,
    ["Culture"],
    "central",
    true,
    null,
    [],
    "Sample workshop, not an available supplier offer.",
  ],
  [
    "snow",
    "Winter snow excursion",
    "Tokyo",
    "visit",
    180,
    9000,
    4500,
    ["Nature"],
    "outer",
    false,
    null,
    [],
    "Winter-only demo fixture. Operates December through February.",
  ],
  [
    "higashiyama",
    "Higashiyama at your pace",
    "Kyoto",
    "visit",
    90,
    600,
    300,
    ["Culture"],
    "east",
    false,
    false,
    [],
    "Historic lanes include slopes and steps in this sample access model.",
  ],
  [
    "riverside",
    "Kamo riverside walk",
    "Kyoto",
    "visit",
    60,
    0,
    0,
    ["Nature"],
    "central",
    false,
    true,
    [],
    "Low-travel alternative. Weather may change the plan.",
  ],
  [
    "tea",
    "Tea and a quiet courtyard",
    "Kyoto",
    "visit",
    75,
    2600,
    1300,
    ["Culture", "Food"],
    "central",
    true,
    true,
    [],
    "A fictional session for this demo. Ingredients require a check.",
  ],
  [
    "museum",
    "Kyoto museum afternoon",
    "Kyoto",
    "visit",
    90,
    1500,
    750,
    ["Culture"],
    "central",
    true,
    true,
    [],
    "Indoor alternative with a sample operating window.",
  ],
  [
    "bamboo",
    "Arashiyama neighborhood",
    "Kyoto",
    "visit",
    100,
    1200,
    600,
    ["Nature"],
    "west",
    false,
    null,
    [],
    "A longer journey than the central options. Access needs a check.",
  ],
  [
    "market",
    "Kyoto market browse",
    "Kyoto",
    "visit",
    75,
    0,
    0,
    ["Food", "Shopping"],
    "central",
    true,
    true,
    [],
    "Tasting purchases are excluded; check individual food ingredients.",
  ],
  [
    "castle",
    "Osaka castle park",
    "Osaka",
    "visit",
    90,
    0,
    0,
    ["Culture", "Nature"],
    "central",
    false,
    true,
    [],
    "Outdoor park visit; entry to paid buildings is excluded.",
  ],
  [
    "city",
    "Osaka city museum",
    "Osaka",
    "visit",
    90,
    1600,
    800,
    ["Culture"],
    "central",
    true,
    true,
    [],
    "Indoor sample alternative. Confirm actual hours before travel.",
  ],
  [
    "dotonbori",
    "Dotonbori by evening",
    "Osaka",
    "visit",
    80,
    0,
    0,
    ["Food", "Shopping"],
    "south",
    false,
    true,
    [],
    "A neighborhood walk. Food and shopping purchases are excluded.",
  ],
  [
    "aquarium",
    "A family aquarium visit",
    "Osaka",
    "visit",
    120,
    3000,
    1500,
    ["Nature"],
    "bay",
    true,
    true,
    [],
    "Illustrative attraction allowance; no inventory is reserved.",
  ],
  [
    "games",
    "Games and pop culture",
    "Osaka",
    "visit",
    80,
    1800,
    900,
    ["Anime", "Shopping"],
    "south",
    true,
    true,
    [],
    "Sample arcade allowance, not a ticket offer.",
  ],
  [
    "closed",
    "Late museum visit",
    "Osaka",
    "visit",
    120,
    900,
    450,
    ["Culture"],
    "central",
    true,
    true,
    [],
    "Testing fixture with an early closing time.",
  ],
  [
    "tokyo-meal",
    "Tokyo lunch candidate",
    "Tokyo",
    "meal",
    60,
    1800,
    900,
    ["Food"],
    "east",
    true,
    true,
    ["Vegetarian"],
    "Vegetarian dishes listed in sample data; fish stock and preparation are unknown.",
  ],
  [
    "tokyo-plant",
    "Plant-based lunch candidate",
    "Tokyo",
    "meal",
    60,
    2100,
    1050,
    ["Food"],
    "central",
    true,
    true,
    ["Vegetarian", "Vegan"],
    "Sample ingredient list excludes fish stock; cross-contact is unconfirmed.",
  ],
  [
    "tokyo-flex",
    "Flexible Tokyo lunch",
    "Tokyo",
    "meal",
    60,
    null,
    null,
    ["Food"],
    "central",
    true,
    null,
    [],
    "Meal not yet selected or priced.",
  ],
  [
    "kyoto-meal",
    "Kyoto lunch candidate",
    "Kyoto",
    "meal",
    60,
    1900,
    950,
    ["Food"],
    "central",
    true,
    null,
    ["Vegetarian"],
    "Ingredients and step-free access require provider confirmation.",
  ],
  [
    "kyoto-plant",
    "Plant-based Kyoto lunch",
    "Kyoto",
    "meal",
    60,
    2200,
    1100,
    ["Food"],
    "central",
    true,
    true,
    ["Vegetarian", "Vegan"],
    "Sample ingredient list excludes fish stock; preparation needs checking.",
  ],
  [
    "kyoto-flex",
    "Flexible Kyoto lunch",
    "Kyoto",
    "meal",
    60,
    null,
    null,
    ["Food"],
    "east",
    true,
    null,
    [],
    "Meal not yet selected or priced.",
  ],
  [
    "osaka-meal",
    "Osaka lunch candidate",
    "Osaka",
    "meal",
    60,
    1800,
    900,
    ["Food"],
    "south",
    true,
    true,
    ["Vegetarian"],
    "Fish stock is present in the demo recipe. Choose another candidate if excluded.",
  ],
  [
    "osaka-plant",
    "Plant-based Osaka lunch",
    "Osaka",
    "meal",
    60,
    2200,
    1100,
    ["Food"],
    "central",
    true,
    true,
    ["Vegetarian", "Vegan"],
    "Sample ingredient list excludes fish stock; cross-contact is unknown.",
  ],
  [
    "osaka-flex",
    "Flexible Osaka lunch",
    "Osaka",
    "meal",
    60,
    null,
    null,
    ["Food"],
    "central",
    true,
    null,
    [],
    "Meal not yet selected or priced.",
  ],
];
export const catalogue: Experience[] = raw.map(
  ([
    id,
    title,
    city,
    kind,
    minutes,
    adult,
    child,
    interests,
    zone,
    indoor,
    stepFree,
    diets,
    note,
  ]) => ({
    id,
    title,
    city,
    kind: kind as "visit" | "meal",
    minutes,
    adult,
    child,
    interests,
    zone,
    indoor,
    stepFree,
    diets,
    note,
    opens: kind === "meal" ? 660 : 540,
    closes: id === "closed" ? 600 : 1080,
    ...(id === "snow" ? { months: [12, 1, 2] } : {}),
  }),
);
export const experiences = Object.fromEntries(catalogue.map((x) => [x.id, x]));
export function dayCount(p: Preferences) {
  return (
    Math.round(
      (Date.parse(p.departure + "T00:00:00Z") -
        Date.parse(p.arrival + "T00:00:00Z")) /
        86400000,
    ) + 1
  );
}
export function validate(p: Preferences): string[] {
  const errors: string[] = [];
  const n = dayCount(p);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(p.arrival) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(p.departure) ||
    !Number.isFinite(n) ||
    n < 5 ||
    n > 10
  )
    errors.push("Choose a trip of 5–10 days, including arrival and departure.");
  if (
    !Number.isInteger(p.adults) ||
    !Number.isInteger(p.children) ||
    p.adults < 1 ||
    p.children < 0 ||
    p.adults + p.children > 6
  )
    errors.push(
      "The demo supports 1–6 travelers, including at least one adult.",
    );
  if (!Number.isFinite(p.budget) || p.budget <= 0)
    errors.push("Enter a group spending limit greater than zero.");
  if (!p.interests.length) errors.push("Choose at least one interest.");
  return errors;
}
export function assess(
  e: Experience,
  p: Preferences,
  date: string,
): { fit: Fit; reasons: string[] } {
  let fit: Fit = "Fits";
  const reasons: string[] = [];
  const add = (state: Fit, reason: string) => {
    if (state === "Conflict" || fit === "Fits") fit = state;
    reasons.push(reason);
  };
  if (e.months && !e.months.includes(Number(date.slice(5, 7))))
    add(
      "Conflict",
      "This seasonal experience falls outside your travel dates.",
    );
  if (p.stepFree && e.stepFree === false)
    add("Conflict", "This sample route includes steps.");
  else if (p.stepFree && e.stepFree === null)
    add("Needs check", "Step-free access has not been confirmed.");
  if (
    e.kind === "meal" &&
    (p.diet !== "No restriction" || p.ingredients.trim())
  ) {
    if (p.diet !== "No restriction" && !e.diets.includes(p.diet))
      add(
        "Needs check",
        `The candidate has no ${p.diet.toLowerCase()} evidence.`,
      );
    if (p.ingredients.trim()) {
      if (e.id === "osaka-meal" && /fish/i.test(p.ingredients))
        add("Conflict", "The sample recipe contains fish stock.");
      else
        add(
          "Needs check",
          `Confirm ${p.ingredients.toLowerCase()} exclusions and preparation with a provider.`,
        );
    } else
      add(
        "Needs check",
        "Confirm the dietary arrangement and preparation with a provider.",
      );
  }
  if (e.adult === null || (p.children > 0 && e.child === null))
    add("Needs check", "A required cost is not priced.");
  if (!reasons.length)
    reasons.push(
      "Matches these preferences under the demo assumptions. Actual arrangements remain unconfirmed.",
    );
  return { fit, reasons };
}
export function costFor(e: Experience, p: Preferences) {
  return e.adult === null || (p.children && e.child === null)
    ? null
    : (e.adult || 0) * p.adults + (e.child || 0) * p.children;
}
function ranked(
  city: City,
  kind: "visit" | "meal",
  p: Preferences,
  date: string,
) {
  return catalogue
    .filter(
      (e) =>
        e.city === city &&
        e.kind === kind &&
        assess(e, p, date).fit !== "Conflict",
    )
    .sort((a, b) => {
      const score = (e: Experience) =>
        e.interests.filter((i) => p.interests.includes(i)).length * 10 +
        (p.pace === "Relaxed" && e.zone !== "outer" ? 4 : 0) +
        (e.indoor ? 1 : 0);
      return score(b) - score(a) || a.id.localeCompare(b.id);
    });
}
export function generate(
  p: Preferences,
  id = "preview",
  name = "Our Japan plan",
): Plan {
  const errors = validate(p);
  if (errors.length) throw new Error(errors.join(" "));
  const n = dayCount(p);
  const people = p.adults + p.children;
  const days: Day[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < n; i++) {
    const date = new Date(Date.parse(p.arrival + "T00:00:00Z") + i * 86400000)
      .toISOString()
      .slice(0, 10);
    const city: City =
      i < Math.ceil(n * 0.4)
        ? "Tokyo"
        : i < Math.ceil(n * 0.75)
          ? "Kyoto"
          : "Osaka";
    const previous = days[i - 1];
    const transfer = previous && previous.city !== city;
    const items: Item[] = [];
    let clock = 540;
    if (transfer) {
      const minutes = city === "Kyoto" ? 180 : 60;
      items.push({
        id: `${i}-transfer`,
        title: `${previous.city} to ${city}`,
        kind: "travel",
        start: clock,
        duration: minutes,
        cost: city === "Kyoto" ? people * 12000 : people * 1200,
        fit: "Needs check",
        reasons: [
          "Journey duration and fare are sample allowances; confirm the actual connection.",
        ],
      });
      clock += minutes + 20;
    }
    const visits = ranked(city, "visit", p, date).sort(
      (a, b) => Number(seen.has(a.id)) - Number(seen.has(b.id)),
    );
    const lunch = ranked(city, "meal", p, date).find(
      (e) =>
        !(
          p.strictDiet &&
          (p.diet !== "No restriction" || p.ingredients.trim()) &&
          assess(e, p, date).fit === "Needs check"
        ),
    );
    const count = p.pace === "Relaxed" ? 2 : p.pace === "Balanced" ? 3 : 4;
    const chosen = visits.slice(0, transfer ? Math.max(1, count - 1) : count);
    chosen.forEach((e, j) => {
      if (j === 1 || (j === 0 && clock >= 700)) {
        addMeal();
      }
      const transit = j ? 20 : 10;
      items.push({
        id: `${i}-travel-${j}`,
        title: "Local journey",
        kind: "travel",
        start: clock,
        duration: transit,
        cost: people * 200,
        fit: "Needs check",
        reasons: [
          "Sample travel allowance. Confirm journey, access, and fare.",
        ],
      });
      clock += transit;
      const start = Math.max(clock, e.opens);
      const check = assess(e, p, date);
      if (start + e.minutes > e.closes) return;
      items.push({
        id: `${i}-${e.id}`,
        experienceId: e.id,
        title: e.title,
        kind: e.kind,
        start,
        duration: e.minutes,
        cost: costFor(e, p),
        ...check,
      });
      clock = start + e.minutes;
      seen.add(e.id);
      items.push({
        id: `${i}-break-${j}`,
        title: "Time to pause",
        kind: "break",
        start: clock,
        duration: 30,
        cost: 0,
        fit: "Fits",
        reasons: ["An unscheduled break in your day."],
      });
      clock += 30;
    });
    if (!items.some((x) => x.kind === "meal")) addMeal();
    function addMeal() {
      if (items.some((x) => x.kind === "meal")) return;
      const start = Math.max(clock, 720);
      items.push(
        lunch
          ? {
              id: `${i}-lunch`,
              experienceId: lunch.id,
              title: lunch.title,
              kind: "meal",
              start,
              duration: 60,
              cost: costFor(lunch, p),
              ...assess(lunch, p, date),
            }
          : {
              id: `${i}-lunch`,
              title: "Lunch to be confirmed",
              kind: "meal",
              start,
              duration: 60,
              cost: null,
              fit: "Needs check",
              reasons: [
                p.strictDiet
                  ? "No candidate has sufficient evidence for your must-have food requirement. This slot stays open."
                  : "Choose and price a lunch candidate.",
              ],
            },
      );
      clock = start + 60;
    }
    const ceiling =
      p.pace === "Relaxed" ? 360 : p.pace === "Balanced" ? 480 : 600;
    while (items.reduce((sum, item) => sum + item.duration, 0) > ceiling) {
      const last = [...items].reverse().find((item) => item.kind === "visit");
      if (!last) break;
      const pos = items.indexOf(last);
      const before = items[pos - 1];
      const after = items[pos + 1];
      const ids = new Set([
        last.id,
        ...(before?.title === "Local journey" ? [before.id] : []),
        ...(after?.kind === "break" ? [after.id] : []),
      ]);
      for (let k = items.length - 1; k >= 0; k--)
        if (ids.has(items[k].id)) items.splice(k, 1);
    }
    days.push({ date, city, items: items.sort((a, b) => a.start - b.start) });
  }
  const now = new Date().toISOString();
  return {
    id,
    schema: 1,
    catalogue: "demo-1",
    name,
    preferences: { ...p },
    days,
    createdAt: now,
    updatedAt: now,
  };
}
export function checkPlan(plan: Plan): Check[] {
  const checks: Check[] = [];
  const p = plan.preferences;
  plan.days.forEach((day, d) => {
    day.items.forEach((item, i) => {
      const e = item.experienceId ? experiences[item.experienceId] : undefined;
      const check = e
        ? assess(e, p, day.date)
        : { fit: item.fit, reasons: item.reasons };
      if (check.fit !== "Fits")
        checks.push({
          id: item.id,
          state: check.fit,
          title: item.title,
          reason: check.reasons.join(" "),
          day: d,
        });
      if (e && (item.start < e.opens || item.start + item.duration > e.closes))
        checks.push({
          id: item.id + "-hours",
          state: "Conflict",
          title: item.title,
          reason: "This visit falls outside the sample operating window.",
          day: d,
        });
      if (i && item.start < day.items[i - 1].start + day.items[i - 1].duration)
        checks.push({
          id: item.id + "-overlap",
          state: "Conflict",
          title: item.title,
          reason: "This item overlaps the previous activity or journey.",
          day: d,
        });
    });
    const total = day.items.reduce((s, i) => s + i.duration, 0);
    const limit =
      p.pace === "Relaxed" ? 360 : p.pace === "Balanced" ? 480 : 600;
    if (total > limit)
      checks.push({
        id: `${d}-pace`,
        state: "Conflict",
        title: `${day.city} pace`,
        reason: `${duration(total)} exceeds your ${p.pace.toLowerCase()} day target of ${duration(limit)}.`,
        day: d,
      });
  });
  const estimate = estimatePlan(plan);
  if (estimate.subtotal > p.budget)
    checks.push({
      id: "budget",
      state: "Conflict",
      title: "Spending range",
      reason: "The known subtotal exceeds your group spending limit.",
    });
  else if (estimate.missing)
    checks.push({
      id: "budget",
      state: "Needs check",
      title: "Spending range",
      reason:
        "Unpriced items mean the full cost cannot yet be checked against your limit.",
    });
  return checks;
}
export function aggregate(checks: Check[]): Fit {
  return checks.some((c) => c.state === "Conflict")
    ? "Conflict"
    : checks.some((c) => c.state === "Needs check")
      ? "Needs check"
      : "Fits";
}
export function estimatePlan(plan: Plan) {
  const p = plan.preferences,
    people = p.adults + p.children,
    n = plan.days.length;
  const categories = [
    {
      name: "Accommodation",
      basis: `${Math.ceil(people / 2)} room${Math.ceil(people / 2) > 1 ? "s" : ""} × ${n - 1} nights`,
      amount: Math.ceil(people / 2) * (n - 1) * 8000,
    },
    {
      name: "Other meals",
      basis: `${people} travelers × ${n} days`,
      amount: people * n * 1200,
    },
    {
      name: "Visits and lunches",
      basis: "Priced items in your schedule",
      amount: plan.days
        .flatMap((d) => d.items)
        .filter((i) => i.kind === "visit" || i.kind === "meal")
        .reduce((s, i) => s + (i.cost ?? 0), 0),
    },
    {
      name: "Transport",
      basis: "Sample journeys in your schedule",
      amount: plan.days
        .flatMap((d) => d.items)
        .filter((i) => i.kind === "travel")
        .reduce((s, i) => s + (i.cost ?? 0), 0),
    },
  ];
  const missing = plan.days
    .flatMap((d) => d.items)
    .filter((i) => i.cost === null).length;
  const subtotal = categories.reduce((s, c) => s + c.amount, 0);
  return {
    categories,
    subtotal,
    average: Math.round(subtotal / people),
    missing,
    people,
    difference: p.budget - subtotal,
  };
}
export function removeItem(plan: Plan, day: number, id: string): Plan {
  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    days: plan.days.map((d, i) =>
      i === day ? { ...d, items: d.items.filter((x) => x.id !== id) } : d,
    ),
  };
}
export function replaceItem(
  plan: Plan,
  day: number,
  id: string,
  eid: string,
): Plan {
  const e = experiences[eid];
  if (!e) throw new Error("Unknown experience");
  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    days: plan.days.map((d, i) =>
      i === day
        ? {
            ...d,
            items: d.items.map((x) =>
              x.id === id
                ? {
                    ...x,
                    experienceId: e.id,
                    title: e.title,
                    kind: e.kind,
                    duration: e.minutes,
                    cost: costFor(e, plan.preferences),
                    ...assess(e, plan.preferences, d.date),
                  }
                : x,
            ),
          }
        : d,
    ),
  };
}
export function moveItem(
  plan: Plan,
  from: number,
  id: string,
  to: number,
): Plan {
  const item = plan.days[from].items.find((x) => x.id === id);
  if (!item || from === to) return plan;
  if (item.locked) throw new Error("Unlock the item before moving it.");
  if (plan.days[to].city !== plan.days[from].city)
    throw new Error("Move visits between days in the same city.");
  const next = removeItem(plan, from, id);
  const target = next.days[to];
  const start = target.items.length
    ? Math.max(...target.items.map((i) => i.start + i.duration)) + 20
    : 540;
  return {
    ...next,
    days: next.days.map((d, i) =>
      i === to ? { ...d, items: [...d.items, { ...item, start }] } : d,
    ),
  };
}
export function summary(plan: Plan, includeSensitive = false) {
  const e = estimatePlan(plan);
  return `${plan.name}\n${dateLabel(plan.preferences.arrival)} – ${dateLabel(plan.preferences.departure)} · ${e.people} travelers\n${[...new Set(plan.days.map((d) => d.city))].join(" → ")}\n${e.missing ? "Known subtotal" : "Sample estimate"}: ${money(e.subtotal)} for the group · ${money(e.average)} average per traveler\n${e.missing} unpriced items. All arrangements use sample data and need confirmation.\nExcludes international flights, visas, insurance, shopping, and unlisted fees.\n\n${plan.days
    .map(
      (d) =>
        `${dateLabel(d.date)} · ${d.city}\n${d.items
          .filter((i) => i.kind === "visit" || i.kind === "meal")
          .map((i) => `${time(i.start)} ${i.title}`)
          .join("\n")}`,
    )
    .join(
      "\n\n",
    )}${includeSensitive ? `\n\nFood: ${plan.preferences.diet}; exclusions: ${plan.preferences.ingredients || "None stated"}; step-free: ${plan.preferences.stepFree ? "Required" : "Not required"}` : ""}\n\nOpen questions: confirm prices, operating hours, journey details${includeSensitive ? ", dietary arrangements and access" : ""}. This is a demo, not a booking.`;
}
export type Trip = {
  slug: string;
  title: string;
  description: string;
  days: number;
  pace: Preferences["pace"];
  interests: string[];
  image: string;
  months: number[];
  season: string;
  price: number;
};
export const trips: Trip[] = [
  {
    slug: "culture-at-your-pace",
    title: "Culture, at your pace",
    description:
      "Temple lanes, garden afternoons, and enough room to take the long way home.",
    days: 7,
    pace: "Relaxed",
    interests: ["Culture", "Nature"],
    image: "/images/kyoto.webp",
    months: [3, 4, 5, 9, 10, 11],
    season: "Spring and autumn inspiration. Bloom and foliage timing vary.",
    price: 0,
  },
  {
    slug: "a-family-route",
    title: "A little more together",
    description:
      "Shorter days, indoor alternatives, and time for everyone to find their favorite thing.",
    days: 8,
    pace: "Relaxed",
    interests: ["Nature", "Culture"],
    image: "/images/tokyo.webp",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    season: "Year-round sample route, with indoor alternatives for weather.",
    price: 0,
  },
  {
    slug: "city-interests",
    title: "Follow your curiosity",
    description:
      "Tokyo pop culture, Kyoto craftsmanship, and Osaka after dark. Make room for what you love.",
    days: 7,
    pace: "Balanced",
    interests: ["Anime", "Shopping", "Food"],
    image: "/images/osaka.webp",
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    season:
      "Year-round city inspiration. Specific events need dated confirmation.",
    price: 0,
  },
];
export function tripPreferences(trip: Trip): Preferences {
  const p = {
    ...defaultPreferences,
    pace: trip.pace,
    interests: trip.interests,
  };
  p.departure = new Date(
    Date.parse(p.arrival + "T00:00:00Z") + (trip.days - 1) * 86400000,
  )
    .toISOString()
    .slice(0, 10);
  return p;
}
export const STORAGE_KEY = "japan-your-way:plans:v1";
export function readPlans(): Plan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw)
      ? raw.filter(
          (p) =>
            p.schema === 1 &&
            p.catalogue === "demo-1" &&
            Array.isArray(p.days) &&
            p.preferences &&
            typeof p.id === "string",
        )
      : [];
  } catch {
    return [];
  }
}
export function savePlan(plan: Plan) {
  const plans = readPlans();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([plan, ...plans.filter((p) => p.id !== plan.id)]),
  );
}
