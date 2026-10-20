import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultPreferences as defaults,
  generate,
  validate,
  assess,
  experiences,
  estimatePlan,
  checkPlan,
  removeItem,
  replaceItem,
  moveItem,
  summary,
  aggregate,
  tripPreferences,
  trips,
} from "../src/lib/planner";
test("season and known dietary constraints cannot silently pass", () => {
  assert.equal(
    assess(experiences.snow, defaults, "2026-11-10").fit,
    "Conflict",
  );
  assert.equal(
    assess(experiences["osaka-meal"], defaults, "2026-11-10").fit,
    "Conflict",
  );
  assert.equal(
    assess(experiences["kyoto-meal"], defaults, "2026-11-10").fit,
    "Needs check",
  );
  const p = generate(defaults);
  assert(p.days.every((d) => d.items.every((i) => i.experienceId !== "snow")));
  assert(
    p.days.every((d) =>
      d.items.some((i) => i.kind === "meal" && i.cost === null),
    ),
  );
});
test("all preset routes generate without an unflagged overlap or pace violation", () => {
  for (const t of trips) {
    const p = generate(tripPreferences(t));
    const conflicts = checkPlan(p).filter((c) => c.state === "Conflict");
    assert.deepEqual(conflicts, [], t.title);
  }
});
test("schedule edits expose operating-hour and overlap conflicts", () => {
  let p = generate({ ...defaults, pace: "Balanced" });
  const first = p.days[0].items.find((i) => i.kind === "visit")!;
  p.days[0].items = p.days[0].items
    .map((i) => (i.id === first.id ? { ...i, start: 1070 } : i))
    .sort((a, b) => a.start - b.start);
  assert(checkPlan(p).some((c) => c.id === first.id + "-hours"));
  const next = generate(defaults);
  next.days[0].items[1].start = next.days[0].items[0].start;
  assert(checkPlan(next).some((c) => c.id.endsWith("-overlap")));
});
test("costs use rooms and group quantities; missing prices stay missing", () => {
  const p = generate({ ...defaults, adults: 2, children: 1 });
  const e = estimatePlan(p);
  assert.equal(e.categories[0].amount, 2 * 6 * 8000);
  assert.equal(
    e.subtotal,
    e.categories.reduce((s, c) => s + c.amount, 0),
  );
  assert(e.missing > 0);
  const priced = p.days[0].items.find((i) => i.cost !== null && i.cost > 0)!;
  const after = estimatePlan(removeItem(p, 0, priced.id));
  assert.equal(after.subtotal, e.subtotal - priced.cost!);
  assert.equal(after.average, Math.round(after.subtotal / 3));
});
test("known over-budget cost fails and incomplete estimates cannot pass", () => {
  assert(
    checkPlan(generate({ ...defaults, budget: 1, strictBudget: true })).some(
      (c) => c.id === "budget" && c.state === "Conflict",
    ),
  );
  assert(
    checkPlan(
      generate({ ...defaults, budget: 1000000, strictBudget: true }),
    ).some((c) => c.id === "budget" && c.state === "Needs check"),
  );
});
test("replacement recalculates and same-city moves preserve the object", () => {
  const p = generate(defaults);
  const lunch = p.days[0].items.find((i) => i.kind === "meal")!;
  const changed = replaceItem(p, 0, lunch.id, "tokyo-plant");
  assert(estimatePlan(changed).missing < estimatePlan(p).missing);
  const visit = p.days[0].items.find((i) => i.kind === "visit")!;
  const moved = moveItem(p, 0, visit.id, 1);
  assert(!moved.days[0].items.some((i) => i.id === visit.id));
  assert(moved.days[1].items.some((i) => i.id === visit.id));
  assert.throws(() => moveItem(p, 0, visit.id, p.days.length - 1));
});
test("sharing defaults omit dietary and access specifics", () => {
  const p = generate({
    ...defaults,
    ingredients: "Secret ingredient note",
    stepFree: true,
  });
  assert(!summary(p).includes("Secret ingredient note"));
  assert(summary(p, true).includes("Secret ingredient note"));
});
test("invalid dates, groups, and budget are rejected", () => {
  assert(validate({ ...defaults, departure: "2026-11-11" }).length > 0);
  assert(validate({ ...defaults, adults: 0 }).length > 0);
  assert(validate({ ...defaults, budget: NaN }).length > 0);
});
test("generation is deterministic apart from timestamps", () => {
  const a = generate(defaults),
    b = generate(defaults);
  assert.deepEqual(a.days, b.days);
  assert.equal(aggregate(checkPlan(a)), "Needs check");
});

test("ingredient exclusions remain constraints without a dietary preset", () => {
  const p = { ...defaults, diet: "No restriction", ingredients: "Fish stock" };
  assert.equal(
    assess(experiences["osaka-meal"], p, "2026-11-10").fit,
    "Conflict",
  );
  assert(
    generate(p).days.every((day) =>
      day.items.every((item) => item.experienceId !== "osaka-meal"),
    ),
  );
});
