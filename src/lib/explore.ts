export type Source = { title: string; url: string };
export type Evidence = "contains" | "may-contain" | "free-verified" | "unknown";
export type DietStatus = "verified" | "verify-dashi" | "no" | "unknown";
export type ImageRef = {
  src: string;
  alt: string;
  credit: string;
  responsive?: boolean;
  /** Shown when the photograph illustrates an area rather than this exact venue. */
  contextLabel?: string;
  /** Bundled, credited area photograph if an optional venue image is unavailable. */
  fallback?: { src: string; alt: string; label: string };
};
export interface Restaurant {
  id: string;
  name: string;
  nameJa?: string;
  region: string;
  city: string;
  ward?: string;
  cuisine: string[];
  priceBand: string;
  diet: { vegetarian: DietStatus; vegan: DietStatus; notes: string };
  ratings: {
    source: string;
    value: number;
    scale: number;
    count?: number;
    asOf: string;
    url: string;
  }[];
  recognition: { name: string; level?: string; year: number; url: string }[];
  signatureDish: {
    name: string;
    why: string;
    allergens: Record<string, Evidence>;
    markers: Record<string, Evidence>;
    basis: string;
    sourceUrl: string;
  };
  worthVisiting: string;
  nearestStationId?: string;
  image?: ImageRef;
  officialUrl?: string;
  sources: Source[];
  checkedOn: string;
}
export interface ShoppingPlace {
  id: string;
  name: string;
  city: string;
  region: string;
  type: string;
  summary: string;
  location: string;
  nearestStations: string[];
  directions: string;
  hours: string;
  closed: string;
  seasonal: string;
  bestPart: string;
  famousFor: string[];
  bestTime: string;
  taxFree?: string;
  officialUrl: string;
  image?: ImageRef;
  sources: Source[];
  checkedOn: string;
}
export interface ExploreFilters {
  tab: "food" | "shopping";
  q: string;
  diet: string;
  needsCheck: boolean;
  regions: string[];
  locations: string[];
  minRating: number;
  ratingSource: string;
  recognition: string;
  price: string;
  cuisine: string;
  sort: "top" | "name";
  type: string;
  place: string;
}
export const defaultFilters: ExploreFilters = {
  tab: "food",
  q: "",
  diet: "all",
  needsCheck: false,
  regions: [],
  locations: [],
  minRating: 0,
  ratingSource: "",
  recognition: "",
  price: "",
  cuisine: "",
  sort: "top",
  type: "",
  place: "",
};
export function readFilters(query: string): ExploreFilters {
  const p = new URLSearchParams(query);
  const min = Number(p.get("min"));
  return {
    ...defaultFilters,
    tab: p.get("tab") === "shopping" ? "shopping" : "food",
    q: (p.get("q") || "").slice(0, 120),
    diet: ["vegetarian", "vegan", "non-vegetarian"].includes(
      p.get("diet") || "",
    )
      ? p.get("diet")!
      : "all",
    needsCheck: p.get("check") === "1",
    regions: p.getAll("region"),
    locations: p.getAll("location"),
    minRating: Number.isFinite(min) && min >= 0 && min <= 100 ? min : 0,
    ratingSource: p.get("source") || "",
    recognition: p.get("recognition") || "",
    price: p.get("price") || "",
    cuisine: p.get("cuisine") || "",
    sort: p.get("sort") === "name" ? "name" : "top",
    type: p.get("type") || "",
    place: p.get("place") || "",
  };
}
export function writeFilters(f: ExploreFilters): string {
  const p = new URLSearchParams();
  for (const [key, value] of [
    ["tab", f.tab],
    ["q", f.q],
    ["diet", f.diet === "all" ? "" : f.diet],
    ["check", f.needsCheck ? "1" : ""],
    ["min", f.minRating ? String(f.minRating) : ""],
    ["source", f.ratingSource],
    ["recognition", f.recognition],
    ["price", f.price],
    ["cuisine", f.cuisine],
    ["sort", f.sort === "name" ? "name" : ""],
    ["type", f.type],
    ["place", f.place],
  ])
    if (value) p.set(key, value);
  f.regions.forEach((v) => p.append("region", v));
  f.locations.forEach((v) => p.append("location", v));
  return p.toString();
}
export function dietMatches(r: Restaurant, f: ExploreFilters): boolean {
  if (f.diet === "all") return true;
  if (f.diet === "non-vegetarian") return r.diet.vegetarian === "no";
  const status = r.diet[f.diet as "vegetarian" | "vegan"];
  return (
    status === "verified" ||
    (f.needsCheck && (status === "unknown" || status === "verify-dashi"))
  );
}
export function recognitionRank(r: Restaurant): number {
  return Math.max(
    0,
    ...r.recognition.map((x) =>
      x.name === "Michelin star"
        ? 10 + Number(x.level || 1)
        : x.name === "Bib Gourmand"
          ? 5
          : x.name === "Michelin Selected"
            ? 4
            : 1,
    ),
  );
}
export function compareRestaurants(
  a: Restaurant,
  b: Restaurant,
  source = "",
): number {
  // Numeric ordering is only within an explicitly selected source AND scale. No normalization or averaging.
  const ar = a.ratings.find((r) => r.source === source),
    br = b.ratings.find((r) => r.source === source);
  if (ar && br && ar.scale === br.scale && ar.value !== br.value)
    return br.value - ar.value;
  if (ar && !br) return -1;
  if (br && !ar) return 1;
  return (
    recognitionRank(b) - recognitionRank(a) ||
    a.name.localeCompare(b.name, "en") ||
    a.id.localeCompare(b.id)
  );
}
export function filterRestaurants(
  data: Restaurant[],
  f: ExploreFilters,
): Restaurant[] {
  const q = f.q.trim().toLowerCase();
  return data
    .filter(
      (r) =>
        dietMatches(r, f) &&
        (!f.regions.length || f.regions.includes(r.region)) &&
        (!f.locations.length ||
          f.locations.includes(r.city) ||
          f.locations.includes(r.ward || "")) &&
        (!q ||
          [r.name, r.nameJa, r.signatureDish.name, ...r.cuisine]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (!f.price || r.priceBand === f.price) &&
        (!f.cuisine || r.cuisine.includes(f.cuisine)) &&
        (!f.recognition ||
          r.recognition.some((x) => x.name === f.recognition)) &&
        (!f.minRating ||
          (!!f.ratingSource &&
            r.ratings.some(
              (x) => x.source === f.ratingSource && x.value >= f.minRating,
            ))),
    )
    .sort(
      f.sort === "name"
        ? (a, b) => a.name.localeCompare(b.name, "en")
        : (a, b) => compareRestaurants(a, b, f.ratingSource),
    );
}
export function filterShopping(
  data: ShoppingPlace[],
  f: ExploreFilters,
): ShoppingPlace[] {
  return data
    .filter(
      (r) =>
        (!f.regions.length || f.regions.includes(r.region)) &&
        (!f.locations.length || f.locations.includes(r.city)) &&
        (!f.type || r.type === f.type) &&
        (!f.q ||
          [r.name, r.summary, ...r.famousFor]
            .join(" ")
            .toLowerCase()
            .includes(f.q.toLowerCase())),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}
export const evidenceText: Record<Evidence, string> = {
  contains: "● Contains",
  "may-contain": "△ May contain",
  "free-verified": "✓ Not used · verified recipe",
  unknown: "? Needs check",
};
export function displayEvidence(value?: Evidence): string {
  return evidenceText[value || "unknown"];
}
export type PersonalNote = { score: number; text: string };
export function readNote(raw: string | null): PersonalNote | null {
  try {
    const n = JSON.parse(raw || "null");
    return n &&
      Number.isInteger(n.score) &&
      n.score >= 1 &&
      n.score <= 5 &&
      typeof n.text === "string"
      ? { score: n.score, text: n.text.slice(0, 1000) }
      : null;
  } catch {
    return null;
  }
}
