import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultFilters,
  readFilters,
  writeFilters,
  filterRestaurants,
  filterShopping,
  compareRestaurants,
  displayEvidence,
  readNote,
} from "../src/lib/explore";
import type { Restaurant } from "../src/lib/explore";
import { allergenConfig } from "../src/data/allergens";
import kanto from "../src/data/reviews/kanto.json";
import kansai from "../src/data/reviews/kansai.json";
import shops from "../src/data/reviews/shopping.json";
import tokyo from "../src/data/metro/tokyo.json";
import osaka from "../src/data/metro/osaka.json";
import kyoto from "../src/data/metro/kyoto.json";
import credits from "../public/images/credits.json";
import sapporo from "../src/data/metro/sapporo.json";
import sendai from "../src/data/metro/sendai.json";
import yokohama from "../src/data/metro/yokohama.json";
import nagoya from "../src/data/metro/nagoya.json";
import kobe from "../src/data/metro/kobe.json";
import fukuoka from "../src/data/metro/fukuoka.json";
import naha from "../src/data/metro/naha.json";
import { validateExplore } from "../src/lib/data-validation";
import {
  metroGraph,
  octilinear,
  searchStations,
  mapLabels,
  fitNetwork,
} from "../src/lib/metro";
import fs from "node:fs";
const data = [...kanto, ...kansai] as Restaurant[];
const networks = [
  tokyo,
  osaka,
  kyoto,
  sapporo,
  sendai,
  yokohama,
  nagoya,
  kobe,
  fukuoka,
  naha,
];
test("filter URLs preserve every choice, multi-select, Japanese search and deep links", () => {
  const f = {
    ...defaultFilters,
    tab: "shopping" as const,
    q: "銀座 & gifts",
    diet: "vegan",
    needsCheck: true,
    regions: ["Kanto", "Kansai"],
    locations: ["Tokyo", "Kyoto"],
    minRating: 4.5,
    ratingSource: "Example source",
    recognition: "Bib Gourmand",
    price: "¥¥",
    cuisine: "Japanese",
    sort: "name" as const,
    type: "mall",
    place: "ginza-six",
  };
  assert.deepEqual(readFilters(writeFilters(f)), f);
  assert.equal(readFilters("?min=NaN&diet=whatever&tab=bad").minRating, 0);
  assert.equal(readFilters("?diet=whatever").diet, "all");
});
test("vegetarian and vegan default to verified; expanded results never include explicit conflicts", () => {
  const r = data[0];
  const fixtures = ["verified", "verify-dashi", "unknown", "no"].map(
    (status, i) => ({
      ...r,
      id: String(i),
      diet: { ...r.diet, vegetarian: status, vegan: status },
    }),
  ) as Restaurant[];
  assert.deepEqual(
    filterRestaurants(fixtures, { ...defaultFilters, diet: "vegan" }).map(
      (x) => x.id,
    ),
    ["0"],
  );
  assert.equal(
    filterRestaurants(fixtures, {
      ...defaultFilters,
      diet: "vegetarian",
      needsCheck: true,
    }).length,
    3,
  );
  assert.deepEqual(
    filterRestaurants(fixtures, {
      ...defaultFilters,
      diet: "non-vegetarian",
    }).map((x) => x.id),
    ["3"],
  );
  assert.equal(
    filterRestaurants(data, { ...defaultFilters, diet: "vegan" }).length,
    8,
  );
});
test("numeric minima require their named source; no normalization or mixed-source averaging", () => {
  const r = data[0];
  const a = {
      ...r,
      id: "a",
      name: "A",
      ratings: [
        {
          source: "S",
          value: 4.8,
          scale: 5,
          asOf: "2026-10-24",
          url: "https://example.org/a",
        },
      ],
    },
    b = {
      ...r,
      id: "b",
      name: "B",
      ratings: [
        {
          source: "Other",
          value: 99,
          scale: 100,
          asOf: "2026-10-24",
          url: "https://example.org/b",
        },
      ],
    };
  assert.deepEqual(
    filterRestaurants([a, b], {
      ...defaultFilters,
      minRating: 4.5,
      ratingSource: "S",
    }).map((x) => x.id),
    ["a"],
  );
  assert.equal(
    filterRestaurants([a, b], { ...defaultFilters, minRating: 4.5 }).length,
    0,
  );
  assert.ok(compareRestaurants(a, b, "S") < 0);
  assert.equal(
    filterRestaurants(data, {
      ...defaultFilters,
      minRating: 3,
      ratingSource: "S",
    }).length,
    0,
  );
});
test("location, dish search, recognition, price and cuisine compose, without changing inputs", () => {
  const snapshot = JSON.stringify(data);
  const filtered = filterRestaurants(data, {
    ...defaultFilters,
    q: "walnut",
    locations: ["Tokyo"],
    cuisine: "Plant-based",
  });
  assert.equal(filtered.length, 3);
  assert.ok(filtered.every((r) => r.diet.vegan === "verified"));
  assert.ok(
    filterRestaurants(data, {
      ...defaultFilters,
      recognition: "Michelin star",
    }).every((r) => r.recognition.some((x) => x.name === "Michelin star")),
  );
  assert.equal(
    filterRestaurants(data, { ...defaultFilters, price: "¥¥" }).length,
    1,
  );
  assert.equal(JSON.stringify(data), snapshot);
  assert.ok(
    filterShopping(shops, {
      ...defaultFilters,
      type: "market",
      locations: ["Osaka"],
    }).every((r) => r.type === "market" && r.city === "Osaka"),
  );
  assert.equal(
    filterShopping(shops, { ...defaultFilters, q: "unfindable xxx" }).length,
    0,
  );
});
test("CAA April 2026 config has 9 mandatory and 20 recommended, including the cashew/pistachio change", () => {
  assert.equal(allergenConfig.mandatory.length, 9);
  assert.equal(allergenConfig.recommended.length, 20);
  assert.ok(allergenConfig.mandatory.includes("cashew"));
  assert.ok(allergenConfig.recommended.includes("pistachio"));
  assert.ok(!allergenConfig.recommended.includes("cashew"));
  assert.equal(
    new Set([...allergenConfig.mandatory, ...allergenConfig.recommended]).size,
    29,
  );
  assert.match(displayEvidence(), /Needs check/);
  assert.match(displayEvidence("contains"), /● Contains/);
  assert.match(displayEvidence("may-contain"), /△ May contain/);
  assert.match(displayEvidence("free-verified"), /verified recipe/);
});
test("private notes reject corrupt storage and invalid scores, and limit retained text", () => {
  assert.equal(readNote("broken"), null);
  assert.equal(readNote(null), null);
  assert.equal(readNote('{"score":9,"text":"x"}'), null);
  assert.equal(readNote('{"score":3.1,"text":"x"}'), null);
  assert.deepEqual(readNote('{"score":4,"text":"Good stop"}'), {
    score: 4,
    text: "Good stop",
  });
  assert.equal(
    readNote(JSON.stringify({ score: 2, text: "a".repeat(1200) }))?.text.length,
    1000,
  );
});
test("catalogue validates with and without optional personal photographs", () => {
  for (const without of [false, true]) {
    const r = validateExplore(data, shops, networks, credits, (p) =>
      without && p.includes("/personal-use/") ? false : fs.existsSync(p),
    );
    assert.deepEqual(r.errors, []);
    if (without) assert.ok(r.warnings.length > 0);
  }
});
test("validator catches missing sources, impossible dates, unknown stations and uncredited images", () => {
  const bad = {
    ...data[0],
    id: "bad",
    sources: [],
    checkedOn: "2026-02-30",
    nearestStationId: "invented",
    image: { src: "/images/no.webp", alt: "Missing", credit: "missing" },
  };
  const r = validateExplore([bad], [], networks, credits, () => false);
  for (const term of [
    "sources",
    "checkedOn",
    "unknown station",
    "credits",
    "missing image",
  ])
    assert.ok(
      r.errors.some((e) => e.includes(term)),
      term,
    );
});
test("all required systems, branches and station counts are present", () => {
  assert.equal(tokyo.lines.length, 14);
  assert.equal(osaka.lines.length, 9);
  assert.equal(kyoto.lines.length, 2);
  assert.deepEqual(
    tokyo.lines.map((l) => l.code),
    ["G", "M", "m", "H", "T", "C", "Y", "Z", "N", "F", "A", "I", "S", "E"],
  );
  assert.ok(
    osaka.stations.some(
      (s) => s.codes.includes("C09") && s.nameEn === "Yumeshima",
    ),
  );
  assert.equal(tokyo.lines.find((l) => l.code === "m")?.stationIds.length, 4);
  assert.equal(kyoto.stations.length, 31);
  assert.equal(osaka.stations.length, 109);
  assert.equal(tokyo.stations.length, 216);
});
test("graphs are connected and symmetric, with an explicit Oedo closure and named walking interchanges", () => {
  for (const n of networks) {
    const graph = metroGraph(n);
    for (const [id, edges] of graph)
      for (const next of edges) assert.ok(graph.get(next)?.has(id));
    const visited = new Set<string>();
    const queue = [n.stations[0].id];
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      queue.push(...graph.get(id)!);
    }
    assert.equal(visited.size, n.stations.length);
  }
  const g = metroGraph(tokyo);
  assert.ok(g.get("tokyo-tochomae")?.has("tokyo-shinjuku-nishiguchi"));
  assert.ok(g.get("tokyo-akasaka-mitsuke")?.has("tokyo-nagatacho"));
  assert.ok(!g.get("tokyo-hikarigaoka")?.has("tokyo-shinjuku-nishiguchi"));
});
test("connected network paths are octilinear and readable labels avoid every rail segment", () => {
  for (const n of networks) {
    for (const l of n.lines) {
      for (const segment of l.segments)
        segment
          .slice(1)
          .forEach((p, i) => assert.ok(octilinear(segment[i], p), l.id));
    }
    const view = fitNetwork(n, 1000, 560);
    assert.ok(
      mapLabels(n, view.zoom, view, 1000, 560).length > 0,
      n.lines[0].city,
    );
  }
  assert.deepEqual(
    validateExplore(data, shops, networks, credits, () => true).errors,
    [],
  );
});
test("English station search accepts codes and shows interchanges consistently", () => {
  assert.equal(searchStations(tokyo, "G09")[0]?.nameEn, "Ginza");
  assert.equal(searchStations(osaka, "Yumeshima")[0]?.codes[0], "C09");
  assert.equal(searchStations(tokyo, "not-a-station").length, 0);
  assert.equal(searchStations(tokyo, "")[0], undefined);
  const s = tokyo.stations.find((s) => s.nameEn === "Shibuya")!;
  assert.deepEqual(s.codes, ["G01", "Z01", "F16"]);
});

import national from "../src/data/metro/national.json";
import regions from "../src/data/regions.json";
import { validateNationwide } from "../src/lib/data-validation";
test("nationwide discovery covers 47 prefectures and all corridors resolve to sourced hubs", () => {
  assert.equal(regions.length, 10);
  assert.equal(national.hubs.length, 65);
  assert.equal(national.routes.length, 28);
  assert.deepEqual(validateNationwide(national, regions), []);
  const broken = structuredClone(national);
  broken.routes[0].hubIds.push("absent-hub");
  assert.ok(
    validateNationwide(broken, regions).some((s) => s.includes("unknown hub")),
  );
  assert.ok(
    validateNationwide(national, regions.slice(1)).some((s) =>
      s.includes("47 prefectures"),
    ),
  );
  assert.deepEqual(
    Object.fromEntries(
      networks.map((n) => [n.lines[0].city, n.stations.length]),
    ),
    {
      Tokyo: 216,
      Osaka: 109,
      Kyoto: 31,
      Sapporo: 46,
      Sendai: 29,
      Yokohama: 40,
      Nagoya: 87,
      Kobe: 26,
      Fukuoka: 36,
      Naha: 19,
    },
  );
});
test("each drawn segment connects the corresponding consecutive stations or explicit extra edge", () => {
  for (const n of networks) {
    for (const l of n.lines) {
      const edges = [
        ...l.stationIds.slice(1).map((id, i) => [l.stationIds[i], id]),
        ...("extraEdges" in l ? l.extraEdges || [] : []),
      ];
      assert.equal(l.segments.length, edges.length, l.id);
      l.segments.forEach((segment, i) => {
        const a = n.stations.find((s) => s.id === edges[i][0])!,
          b = n.stations.find((s) => s.id === edges[i][1])!;
        assert.deepEqual(segment[0], { x: a.layout.x, y: a.layout.y }, l.id);
        assert.deepEqual(
          segment.at(-1),
          { x: b.layout.x, y: b.layout.y },
          l.id,
        );
      });
    }
  }
});

import { panZoom } from "../src/lib/metro";
test("pinch and pointer zoom preserve the anchored station while pan follows the fingers", () => {
  const v = { x: 120, y: -40, zoom: 0.5 },
    from = { x: 150, y: 250 },
    to = { x: 170, y: 265 };
  const next = panZoom(v, from, to, 2);
  assert.equal(next.x + to.x / next.zoom, v.x + from.x / v.zoom);
  assert.equal(next.y + to.y / next.zoom, v.y + from.y / v.zoom);
  assert.deepEqual(panZoom(v, from, to), { x: 80, y: -70, zoom: 0.5 });
  assert.equal(panZoom(v, from, from, 100).zoom, 4);
  assert.equal(panZoom(v, from, from, 0.001).zoom, 0.05);
});
