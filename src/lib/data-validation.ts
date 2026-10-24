import type { Restaurant, ShoppingPlace, Source } from "./explore";
import type { MetroData } from "./metro";
import { octilinear, mapLabels, fitNetwork, segmentCrossesBox } from "./metro";
export type Credit = {
  ref: string;
  src?: string;
  file?: string;
  title: string;
  sourceUrl?: string;
  page?: string;
  license: string;
};
export function validateExplore(
  restaurants: Restaurant[],
  shops: ShoppingPlace[],
  networks: MetroData[],
  credits: Credit[],
  exists: (path: string) => boolean,
) {
  const errors: string[] = [],
    warnings: string[] = [];
  const seen = new Set<string>();
  const stations = networks.flatMap((n) => n.stations);
  const stationIds = new Set(stations.map((s) => s.id));
  const allLines = networks.flatMap((n) => n.lines);
  const lineIds = new Set(allLines.map((l) => l.id));
  const creditMap = new Map(credits.map((c) => [c.ref, c]));
  const url = (s: string) => {
    try {
      return new URL(s).protocol === "https:";
    } catch {
      return false;
    }
  };
  const record = (r: { id: string; sources: Source[]; checkedOn: string }) => {
    if (seen.has(r.id)) errors.push("Duplicate id: " + r.id);
    seen.add(r.id);
    if (!r.sources.length || r.sources.some((s) => !s.title || !url(s.url)))
      errors.push(r.id + ": missing or invalid sources");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(r.checkedOn) ||
      !Number.isFinite(Date.parse(r.checkedOn)) ||
      new Date(r.checkedOn).toISOString().slice(0, 10) !== r.checkedOn
    )
      errors.push(r.id + ": bad checkedOn");
  };
  const image = (r: {
    id: string;
    image?: { src: string; alt: string; credit: string };
  }) => {
    if (!r.image) return;
    const i = r.image,
      c = creditMap.get(i.credit);
    if (!c || !c.title || !url(c.sourceUrl || c.page || "") || !c.license)
      errors.push(r.id + ": image has no complete credits");
    if (!i.alt || !i.src.startsWith("/images/"))
      errors.push(r.id + ": invalid image path / alt");
    if (
      c &&
      c.license === "unverified - personal use" &&
      !i.src.startsWith("/images/personal-use/")
    )
      errors.push(r.id + ": non-open image outside ignored folder");
    const files = i.src.includes("-1280.webp")
      ? [640, 1280, 1920].map((w) => i.src.replace("-1280.webp", `-${w}.webp`))
      : [i.src];
    for (const file of files)
      if (!exists("public" + file)) {
        (file.startsWith("/images/personal-use/") ? warnings : errors).push(
          r.id + ": missing image " + file,
        );
      }
  };
  for (const r of [...restaurants, ...shops]) {
    record(r);
    image(r);
    const ids =
      "nearestStations" in r
        ? r.nearestStations
        : r.nearestStationId
          ? [r.nearestStationId]
          : [];
    ids.forEach((id) => {
      if (!stationIds.has(id)) errors.push(r.id + ": unknown station " + id);
    });
  }
  for (const r of restaurants) {
    if (
      !r.worthVisiting ||
      !r.signatureDish.sourceUrl ||
      !url(r.signatureDish.sourceUrl)
    )
      errors.push(r.id + ": missing visiting / dish evidence");
    r.ratings.forEach((x) => {
      if (
        x.value < 0 ||
        x.scale <= 0 ||
        x.value > x.scale ||
        !url(x.url) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(x.asOf)
      )
        errors.push(r.id + ": invalid rating");
    });
    r.recognition.forEach((x) => {
      if (!url(x.url) || !Number.isInteger(x.year) || x.year < 1900)
        errors.push(r.id + ": invalid recognition");
    });
    for (const e of [
      ...Object.values(r.signatureDish.allergens),
      ...Object.values(r.signatureDish.markers),
    ])
      if (!["contains", "may-contain", "free-verified", "unknown"].includes(e))
        errors.push(r.id + ": invalid ingredient evidence");
  }
  for (const s of stations) {
    record(s);
    s.lineIds.forEach((id) => {
      if (
        !lineIds.has(id) ||
        !allLines.find((l) => l.id === id)?.stationIds.includes(s.id)
      )
        errors.push(s.id + ": asymmetric line reference " + id);
    });
    s.interchangeIds?.forEach((id) => {
      if (!stations.find((s) => s.id === id)?.interchangeIds?.includes(s.id))
        errors.push(s.id + ": asymmetric interchange " + id);
    });
  }
  for (const n of networks) {
    const coordinates = new Set<string>();
    n.stations.forEach((s) => {
      const key = s.layout.x + "," + s.layout.y;
      if (coordinates.has(key))
        errors.push(s.id + ": overlapping station coordinate");
      coordinates.add(key);
    });
    n.lines.forEach((l) => {
      record(l);
      l.stationIds.forEach((id) => {
        if (!n.stations.find((s) => s.id === id)?.lineIds.includes(l.id))
          errors.push(l.id + ": unknown / asymmetric station " + id);
      });
      l.extraEdges?.flat().forEach((id) => {
        if (!l.stationIds.includes(id))
          errors.push(l.id + ": unknown extra edge " + id);
      });
      if (!l.segments?.length)
        errors.push(l.id + ": missing connected line geometry");
      for (const segment of l.segments || []) {
        segment.slice(1).forEach((b, i) => {
          if (!octilinear(segment[i], b))
            errors.push(l.id + ": non-octilinear path");
        });
      }
    });
    const view = fitNetwork(n, 1000, 560);
    const labels = mapLabels(n, view.zoom, view, 1000, 560);
    const segments = n.lines.flatMap((l) =>
      (l.segments || []).flatMap((seg) =>
        seg.slice(1).map((b, i) => [seg[i], b] as const),
      ),
    );
    for (const label of labels) {
      if (segments.some(([a, b]) => segmentCrossesBox(a, b, label.box)))
        errors.push(label.station.id + ": visible label intersects a line");
    }
  }

  return { errors, warnings };
}

export function validateNationwide(
  national: {
    hubs: { id: string; sources: Source[]; checkedOn: string }[];
    routes: {
      id: string;
      hubIds: string[];
      sources: Source[];
      checkedOn: string;
    }[];
  },
  regions: {
    id: string;
    prefectures: string[];
    sources: Source[];
    checkedOn: string;
  }[],
) {
  const errors: string[] = [];
  const hubs = new Set(national.hubs.map((h) => h.id));
  for (const collection of [national.hubs, national.routes, regions]) {
    const ids = new Set<string>();
    for (const item of collection) {
      if (ids.has(item.id)) errors.push("Duplicate nationwide id: " + item.id);
      ids.add(item.id);
      if (
        !item.sources.length ||
        item.sources.some((s) => !s.title || !s.url.startsWith("https://"))
      )
        errors.push(item.id + ": source missing");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.checkedOn))
        errors.push(item.id + ": date missing");
    }
  }
  for (const route of national.routes) {
    if (route.hubIds.length < 2)
      errors.push(route.id + ": incomplete corridor");
    for (const id of route.hubIds)
      if (!hubs.has(id)) errors.push(route.id + ": unknown hub " + id);
  }
  const prefectures = regions.flatMap((r) => r.prefectures);
  if (prefectures.length !== 47 || new Set(prefectures).size !== 47)
    errors.push("Discovery must cover each of the 47 prefectures once");
  return errors;
}
