"use client";
import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  SlidersHorizontal,
  Utensils,
  ShoppingBag,
  MapPin,
  Leaf,
} from "lucide-react";
import { Modal } from "./shared";
import { PlacePhoto, Sources, usePageQuery } from "./explore-shared";
import { IngredientIcon } from "./ingredient-icon";
import { allergenConfig, ingredientName } from "@/data/allergens";
import {
  defaultFilters,
  readFilters,
  writeFilters,
  filterRestaurants,
  filterShopping,
  displayEvidence,
  readNote,
} from "@/lib/explore";
import type { Restaurant, ShoppingPlace, ExploreFilters } from "@/lib/explore";
import { stationLink } from "@/lib/metro";
const types: Record<string, string> = {
  district: "Districts & streets",
  mall: "Department stores & malls",
  market: "Markets",
  specialty: "Specialty areas",
};
export function ReviewsHub({
  initial,
  shopping,
}: {
  initial: Restaurant[];
  shopping: ShoppingPlace[];
}) {
  const [data, setData] = useState(initial);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [f, update] = usePageQuery(defaultFilters, readFilters, writeFilters);
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState(f);
  const [page, setPage] = useState(0);
  const load = () => {
    setLoading(true);
    setLoadError(false);
    Promise.all([
      import("@/data/reviews/kanto.json"),
      import("@/data/reviews/kansai.json"),
    ])
      .then(([a, b]) => setData([...a.default, ...b.default] as Restaurant[]))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const food = useMemo(() => filterRestaurants(data, f), [data, f]);
  const shops = useMemo(() => filterShopping(shopping, f), [shopping, f]);
  const results = f.tab === "food" ? food : shops;
  const selected =
    f.tab === "food"
      ? data.find((r) => r.id === f.place)
      : shopping.find((r) => r.id === f.place);
  const set = (patch: Partial<ExploreFilters>) => {
    update({ ...f, ...patch, place: "" });
    setPage(0);
  };
  const open = (id: string) => update({ ...f, place: id }, true);
  const close = () => update({ ...f, place: "" });
  const size = 24;
  const pages = Math.max(1, Math.ceil(results.length / size));
  const current = Math.min(page, pages - 1);
  const active = [
    ...(f.q ? [["q", `Search: ${f.q}`]] : []),
    ...(f.diet !== "all" ? [["diet", f.diet]] : []),
    ...f.regions.map((x) => ["region", x]),
    ...f.locations.map((x) => ["location", x]),
    ...(f.recognition ? [["recognition", f.recognition]] : []),
    ...(f.price ? [["price", f.price]] : []),
    ...(f.cuisine ? [["cuisine", f.cuisine]] : []),
    ...(f.type ? [["type", types[f.type]]] : []),
    ...(f.minRating
      ? [
          [
            "minRating",
            `Minimum ${f.minRating} · ${f.ratingSource || "choose source"}`,
          ],
        ]
      : []),
    ...(f.needsCheck ? [["needsCheck", "Includes Needs check"]] : []),
  ];
  const remove = (key: string, value: string) => {
    if (key === "region")
      set({ regions: f.regions.filter((x) => x !== value) });
    else if (key === "location")
      set({ locations: f.locations.filter((x) => x !== value) });
    else
      set({
        [key]:
          key === "diet"
            ? "all"
            : key === "minRating"
              ? 0
              : key === "needsCheck"
                ? false
                : "",
      });
  };
  return (
    <section
      className="reviews-workspace explore-wrap"
      aria-label="Reviews explorer"
    >
      <div
        className="explore-tabs"
        role="tablist"
        aria-label="Review categories"
      >
        {(["food", "shopping"] as const).map((tab, i) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            role="tab"
            aria-controls="review-results"
            aria-selected={f.tab === tab}
            tabIndex={f.tab === tab ? 0 : -1}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                const next =
                  e.key === "Home"
                    ? "food"
                    : e.key === "End"
                      ? "shopping"
                      : i === 0
                        ? "shopping"
                        : "food";
                set({ tab: next, regions: [], locations: [], type: "" });
                document.getElementById(`tab-${next}`)?.focus();
              }
            }}
            onClick={() => set({ tab, regions: [], locations: [], type: "" })}
          >
            {tab === "food" ? (
              <Utensils size={19} />
            ) : (
              <ShoppingBag size={19} />
            )}{" "}
            {tab === "food" ? "Food" : "Shopping"}
          </button>
        ))}
      </div>
      <p className="explore-honesty">
        Sourced and dated, always worth a fresh check. Public scores are never
        invented; your notes stay on this device.
      </p>
      {f.tab === "shopping" && (
        <div className="shopping-mobile-layers">
          <label>
            City
            <select
              value={f.regions.length > 1 ? "multiple" : f.regions[0] || ""}
              onChange={(e) =>
                set({
                  regions: e.target.value ? [e.target.value] : [],
                  locations: [],
                })
              }
            >
              <option value="">All Japan</option>
              {f.regions.length > 1 && (
                <option value="multiple" disabled>
                  Multiple cities
                </option>
              )}
              {["Tokyo", "Osaka", "Kyoto", "Other Japan"].map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </label>
          <label>
            Shopping type
            <select
              value={f.type}
              onChange={(e) => set({ type: e.target.value })}
            >
              <option value="">All types</option>
              {Object.entries(types).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {f.tab === "shopping" && (
        <div className="shopping-layers">
          <fieldset>
            <legend>First, choose a city</legend>
            {["Tokyo", "Osaka", "Kyoto", "Other Japan"].map((city) => (
              <button
                key={city}
                aria-pressed={f.regions.includes(city)}
                onClick={() =>
                  set({ regions: f.regions.includes(city) ? [] : [city] })
                }
              >
                {city}
              </button>
            ))}
          </fieldset>
          <fieldset>
            <legend>Then, find your kind of shopping</legend>
            {Object.entries(types).map(([value, label]) => (
              <button
                key={value}
                aria-pressed={f.type === value}
                onClick={() => set({ type: f.type === value ? "" : value })}
              >
                {label}
              </button>
            ))}
          </fieldset>
        </div>
      )}
      <div className="review-toolbar">
        <label className="explore-search">
          Search places
          <input
            type="search"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder={
              f.tab === "food" ? "Name, dish or cuisine" : "Name or specialty"
            }
          />
        </label>
        <button
          className="button secondary mobile-filter"
          onClick={() => {
            setDraft(f);
            setSheet(true);
          }}
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
        <label>
          Sort
          <select
            value={f.sort}
            onChange={(e) => set({ sort: e.target.value as "top" | "name" })}
          >
            <option value="top">Top rated</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>
      <div className="reviews-columns">
        <aside className="desktop-filters">
          <FilterControls
            f={f}
            onChange={(patch) => set(patch)}
            data={data}
            shopping={shopping}
          />
        </aside>
        <div
          id="review-results"
          role="tabpanel"
          aria-labelledby={`tab-${f.tab}`}
          tabIndex={-1}
        >
          <div className="filter-chips">
            {active.map(([key, value]) => (
              <button
                key={key + value}
                onClick={() => remove(key, value)}
                aria-label={`Remove ${value} filter`}
              >
                {value} <span aria-hidden="true">×</span>
              </button>
            ))}
            {active.length > 0 && (
              <button
                onClick={() => {
                  update({ ...defaultFilters, tab: f.tab });
                  setPage(0);
                }}
              >
                Clear all
              </button>
            )}
          </div>
          <p className="result-count" role="status" aria-live="polite">
            {loading
              ? "Loading the regional catalogue…"
              : `${results.length} ${f.tab === "food" ? "restaurants" : "shopping places"}`}
            {loadError ? " · Some regions could not load." : ""}
          </p>
          {loadError && (
            <button className="button secondary" onClick={load}>
              Retry loading regions
            </button>
          )}
          {f.tab === "food" && (
            <>
              <section className="top-rated">
                <div className="section-heading">
                  <h2>Top rated</h2>
                  <span>Recognition, with context</span>
                </div>
                <p className="ranking-note">
                  No numeric public scores are stored in this edition. Order:
                  Michelin stars (3 → 1), Bib Gourmand, Michelin Selected, then
                  name. Recognition is not a numeric rating; sources and years
                  stay visible. Selecting a numeric minimum requires a source
                  and excludes unscored places.
                </p>
                <div className="top-rail">
                  {food.slice(0, 3).map((r) => (
                    <article key={r.id} data-enter>
                      <p>
                        {r.city} · {r.cuisine.join(", ")}
                      </p>
                      <button
                        className="place-title"
                        onClick={() => open(r.id)}
                      >
                        {r.name} <ArrowUpRight size={18} />
                      </button>
                      <p>
                        {r.recognition
                          .map(
                            (x) =>
                              `${x.name}${x.level ? " · " + x.level + " star" : ""} · ${x.year}`,
                          )
                          .join(" / ") || "Documented specialist"}
                      </p>
                      <p>
                        <strong>
                          {r.signatureDish.name === "Needs check"
                            ? "Signature dish · Needs check"
                            : r.signatureDish.name}
                        </strong>
                      </p>
                      <a
                        href={r.signatureDish.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Dish evidence ↗
                      </a>
                      <div className="allergen-preview">
                        {["wheat", "soy", "sesame"].map((name) => (
                          <span
                            key={name}
                            title={`${ingredientName(name)}: ${displayEvidence(r.signatureDish.allergens[name])}`}
                          >
                            <IngredientIcon name={name} />
                            <span>{ingredientName(name)}</span>
                            <span className="evidence-caption">
                              {displayEvidence(r.signatureDish.allergens[name])}
                            </span>
                          </span>
                        ))}
                        <p>Ingredients: confirm at source</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <AllergenKey />
            </>
          )}
          <div className="section-heading">
            <h2>
              {f.tab === "food"
                ? "Find your table."
                : "An afternoon well spent."}
            </h2>
            <span>
              Showing {results.length ? current * size + 1 : 0}–
              {Math.min((current + 1) * size, results.length)}
            </span>
          </div>
          {results.length === 0 ? (
            <div className="explore-empty">
              <h3>
                {f.tab === "food"
                  ? "No restaurants match these choices."
                  : "No shopping places match these choices."}
              </h3>
              <p>Remove a filter above, or start fresh.</p>
              <button
                className="button"
                onClick={() => set({ ...defaultFilters, tab: f.tab })}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={f.tab === "food" ? "food-list" : "shopping-grid"}>
              {f.tab === "food"
                ? food.slice(current * size, (current + 1) * size).map((r) => (
                    <article className="food-row" key={r.id} data-enter>
                      <PlacePhoto image={r.image} name={r.name} />
                      <div>
                        <p className="place-meta">
                          {r.city}
                          {r.ward ? " · " + r.ward : ""} ·{" "}
                          {r.cuisine.join(", ")}
                        </p>
                        <h3>
                          <button onClick={() => open(r.id)}>
                            {r.name}
                            <ArrowUpRight size={20} />
                          </button>
                        </h3>
                        <p>
                          {r.recognition
                            .map(
                              (x) =>
                                `${x.name}${x.level ? " · " + x.level + " star" : ""} · ${x.year}`,
                            )
                            .join(" / ") || r.worthVisiting}
                        </p>
                        <p className="diet-status">
                          {r.diet.vegan === "verified" ? (
                            <>
                              <Leaf size={17} /> ✓ Vegan menu verified
                            </>
                          ) : r.diet.vegetarian === "verified" ? (
                            <>✓ Vegetarian menu verified</>
                          ) : (
                            <>? Food requirements · Needs check</>
                          )}
                        </p>
                        <p className="place-meta">
                          Price: {r.priceBand} · Checked {r.checkedOn}
                        </p>
                      </div>
                    </article>
                  ))
                : shops.slice(current * size, (current + 1) * size).map((r) => (
                    <article className="shopping-card" key={r.id} data-enter>
                      <button
                        className="photo-button"
                        onClick={() => open(r.id)}
                        aria-label={`Explore ${r.name}`}
                      >
                        <PlacePhoto image={r.image} name={r.name} />
                        <ArrowUpRight size={22} />
                      </button>
                      <p>
                        {r.city} · {types[r.type]}
                      </p>
                      <h3>
                        <button onClick={() => open(r.id)}>{r.name}</button>
                      </h3>
                      <p>{r.summary}</p>
                    </article>
                  ))}
            </div>
          )}
          {pages > 1 && (
            <nav className="results-pages" aria-label="Result pages">
              <button
                disabled={current === 0}
                onClick={() => {
                  setPage(current - 1);
                  document.getElementById("review-results")?.focus();
                }}
              >
                ← Previous
              </button>
              <span>
                Page {current + 1} of {pages}
              </span>
              <button
                disabled={current === pages - 1}
                onClick={() => {
                  setPage(current + 1);
                  document.getElementById("review-results")?.focus();
                }}
              >
                Next →
              </button>
            </nav>
          )}
        </div>
      </div>
      {sheet && (
        <Modal title="Find your places" onClose={() => setSheet(false)}>
          <FilterControls
            f={draft}
            onChange={(p) => setDraft({ ...draft, ...p })}
            data={data}
            shopping={shopping}
          />
          <p role="status" aria-live="polite">
            {draft.tab === "food"
              ? filterRestaurants(data, draft).length
              : filterShopping(shopping, draft).length}{" "}
            matching places
          </p>
          <button
            className="button"
            onClick={() => {
              update({ ...draft, place: "" });
              setPage(0);
              setSheet(false);
            }}
          >
            Apply filters
          </button>
        </Modal>
      )}
      {selected && (
        <Modal key={selected.id} title={selected.name} onClose={close}>
          {f.tab === "food" ? (
            <FoodDetail r={selected as Restaurant} />
          ) : (
            <ShoppingDetail r={selected as ShoppingPlace} />
          )}
        </Modal>
      )}
      {f.place && !selected && !loading && (
        <div className="explore-empty" role="status">
          This place is not in the current catalogue.{" "}
          <button onClick={close}>Close place link</button>
        </div>
      )}
    </section>
  );
}
function FilterControls({
  f,
  onChange,
  data,
  shopping,
}: {
  f: ExploreFilters;
  onChange: (patch: Partial<ExploreFilters>) => void;
  data: Restaurant[];
  shopping: ShoppingPlace[];
}) {
  const controlId = useId();
  const records = f.tab === "food" ? data : shopping;
  const toggle = (key: "regions" | "locations", value: string) =>
    onChange({
      [key]: f[key].includes(value)
        ? f[key].filter((x) => x !== value)
        : [...f[key], value],
    });
  return (
    <div className="filter-controls">
      {f.tab === "food" && (
        <>
          <fieldset>
            <legend>Food preferences</legend>
            {[
              ["all", "All food"],
              ["vegetarian", "Vegetarian"],
              ["vegan", "Vegan"],
              ["non-vegetarian", "Non-vegetarian"],
            ].map(([v, label]) => (
              <label key={v}>
                <input
                  type="radio"
                  name={`diet-${controlId}`}
                  checked={f.diet === v}
                  onChange={() => onChange({ diet: v })}
                />
                {label}
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                checked={f.needsCheck}
                onChange={(e) => onChange({ needsCheck: e.target.checked })}
              />
              Also show places that need a check
            </label>
            <p>
              Verified by default. Dashi can contain bonito or other fish. Vegan
              does not mean allergen-free.
            </p>
          </fieldset>
        </>
      )}
      <fieldset>
        <legend>Region</legend>
        {Array.from(new Set(records.map((r) => r.region)))
          .sort()
          .map((v) => (
            <label key={v}>
              <input
                type="checkbox"
                checked={f.regions.includes(v)}
                onChange={() => toggle("regions", v)}
              />
              {v}
            </label>
          ))}
      </fieldset>
      <fieldset>
        <legend>City / ward</legend>
        <div className="location-options">
          {Array.from(
            new Set(
              records.flatMap((r) => [
                r.city,
                ...("ward" in r && r.ward ? [r.ward] : []),
              ]),
            ),
          )
            .sort()
            .map((v) => (
              <label key={v}>
                <input
                  type="checkbox"
                  checked={f.locations.includes(v)}
                  onChange={() => toggle("locations", v)}
                />
                {v}
              </label>
            ))}
        </div>
      </fieldset>
      {f.tab === "food" && (
        <>
          <label>
            Recognition
            <select
              value={f.recognition}
              onChange={(e) => onChange({ recognition: e.target.value })}
            >
              <option value="">All recognitions</option>
              {Array.from(
                new Set(data.flatMap((r) => r.recognition.map((x) => x.name))),
              ).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Numeric rating source
            <select
              value={f.ratingSource}
              onChange={(e) =>
                onChange({ ratingSource: e.target.value, minRating: 0 })
              }
            >
              <option value="">No public scores stored</option>
              {Array.from(
                new Set(data.flatMap((r) => r.ratings.map((x) => x.source))),
              ).map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Minimum numeric rating
            <select
              value={f.minRating}
              onChange={(e) => onChange({ minRating: Number(e.target.value) })}
            >
              <option value="0">Any / unscored</option>
              {[3, 3.5, 4, 4.5].map((n) => (
                <option key={n} value={n}>
                  {n}+ · selected source’s scale
                </option>
              ))}
            </select>
          </label>
          <label>
            Price band
            <select
              value={f.price}
              onChange={(e) => onChange({ price: e.target.value })}
            >
              <option value="">Any price / unverified</option>
              {["¥", "¥¥", "¥¥¥", "¥¥¥¥", "Needs check"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Cuisine
            <select
              value={f.cuisine}
              onChange={(e) => onChange({ cuisine: e.target.value })}
            >
              <option value="">All cuisines</option>
              {Array.from(new Set(data.flatMap((r) => r.cuisine)))
                .sort()
                .map((v) => (
                  <option key={v}>{v}</option>
                ))}
            </select>
          </label>
        </>
      )}
    </div>
  );
}
export function AllergenKey() {
  return (
    <details className="allergen-key">
      <summary>Allergen key & how to read the evidence</summary>
      <p>
        ● Contains · △ May contain · ✓ Not used in verified recipe · ? Needs
        check. “Not used” does not certify a kitchen free of cross-contact.
      </p>
      <h3>Allergens · 9 mandatory</h3>
      <div className="ingredient-key-grid">
        {allergenConfig.mandatory.map((x) => (
          <span key={x}>
            <IngredientIcon name={x} />
            {ingredientName(x)}
          </span>
        ))}
      </div>
      <h3>20 recommended</h3>
      <div className="ingredient-key-grid">
        {allergenConfig.recommended.map((x) => (
          <span key={x}>
            <IngredientIcon name={x} />
            {ingredientName(x)}
          </span>
        ))}
      </div>
      <h3>Diet markers</h3>
      <div className="ingredient-key-grid">
        {allergenConfig.markers.map((x) => (
          <span key={x}>
            <IngredientIcon name={x} />
            {ingredientName(x)}
          </span>
        ))}
      </div>
      <p>{allergenConfig.note}</p>
      <p>
        Indicative information, not medical or food-safety advice. Confirm with
        the restaurant.
      </p>
      <a href={allergenConfig.sourceUrl} target="_blank" rel="noreferrer">
        {allergenConfig.version} · checked {allergenConfig.checkedOn} ↗
      </a>
    </details>
  );
}
function FoodDetail({ r }: { r: Restaurant }) {
  return (
    <div className="place-detail">
      <PlacePhoto image={r.image} name={r.name} />
      {r.nameJa && (
        <p lang="ja" className="show-to-staff">
          {r.nameJa}
        </p>
      )}
      <p>
        {r.city} · {r.cuisine.join(", ")} · Price {r.priceBand}
      </p>
      <h3>Why visit</h3>
      <p>{r.worthVisiting}</p>
      {r.recognition.map((x) => (
        <p key={x.name}>
          <a href={x.url} target="_blank" rel="noreferrer">
            {x.name} {x.level ? `· ${x.level} star` : ""} · {x.year} ↗
          </a>
        </p>
      ))}
      <h3>Public ratings</h3>
      {r.ratings.length ? (
        r.ratings.map((x) => (
          <p key={x.source}>
            <a href={x.url}>
              {x.value}/{x.scale} · {x.source} · as of {x.asOf}
            </a>
          </p>
        ))
      ) : (
        <p>Needs check · no lawfully sourced numeric rating is stored.</p>
      )}
      <h3>
        {r.signatureDish.name === "Needs check"
          ? "Signature dish · Needs check"
          : r.signatureDish.name}
      </h3>
      <p>{r.signatureDish.why}</p>
      <p>
        {r.signatureDish.basis}{" "}
        <a href={r.signatureDish.sourceUrl} target="_blank" rel="noreferrer">
          Dish source ↗
        </a>
      </p>
      <h3>Food requirements</h3>
      <p>
        Vegetarian:{" "}
        {r.diet.vegetarian === "verified"
          ? "✓ Menu policy verified"
          : r.diet.vegetarian === "no"
            ? "× Conflict"
            : "? Needs check"}{" "}
        · Vegan:{" "}
        {r.diet.vegan === "verified"
          ? "✓ Menu policy verified"
          : "? Needs check"}
      </p>
      <p>{r.diet.notes}</p>
      <details open>
        <summary>Ingredient evidence</summary>
        <div className="evidence-grid">
          {Array.from(
            new Set([
              ...allergenConfig.mandatory,
              ...allergenConfig.recommended,
              ...allergenConfig.markers,
            ]),
          ).map((x) => (
            <div key={x}>
              <IngredientIcon name={x} />
              <span>{ingredientName(x)}</span>
              <span>
                {displayEvidence(
                  r.signatureDish.allergens[x] || r.signatureDish.markers[x],
                )}
              </span>
            </div>
          ))}
        </div>
      </details>
      <p>
        Indicative information, not medical or food-safety advice. Ask the
        restaurant about recipe changes and cross-contact.
      </p>
      <h3>Get there</h3>
      {r.nearestStationId ? (
        <Link
          className="button secondary"
          href={stationLink(r.nearestStationId)}
        >
          <MapPin size={17} /> View nearest metro station
        </Link>
      ) : (
        <p>Nearest station · Needs check</p>
      )}
      {r.officialUrl && (
        <p>
          <a href={r.officialUrl} target="_blank" rel="noreferrer">
            Official website ↗
          </a>
        </p>
      )}
      <YourNote id={r.id} />
      <Sources sources={r.sources} checkedOn={r.checkedOn} />
    </div>
  );
}
function ShoppingDetail({ r }: { r: ShoppingPlace }) {
  return (
    <div className="place-detail">
      <PlacePhoto image={r.image} name={r.name} />
      <p>
        {r.city} · {types[r.type]}
      </p>
      <h3>The place</h3>
      <p>{r.summary}</p>
      <p>
        Numeric public rating · Needs check. This is an original editorial
        overview.
      </p>
      <h3>Famous for</h3>
      <p>{r.famousFor.join(" · ")}</p>
      <h3>Best part</h3>
      <p>{r.bestPart}</p>
      <h3>Getting there</h3>
      <p>{r.location}</p>
      <p>{r.directions}</p>
      {r.nearestStations.map((id) => (
        <Link className="button secondary" key={id} href={stationLink(id)}>
          <MapPin size={17} /> {id.replace(/^[^-]+-/, "").replaceAll("-", " ")}{" "}
          metro
        </Link>
      ))}
      <h3>Opening & closing</h3>
      <p>{r.hours}</p>
      <p>Closed days: {r.closed}</p>
      <p>{r.seasonal}</p>
      <a href={r.officialUrl} target="_blank" rel="noreferrer">
        {r.officialUrl.includes("wikipedia")
          ? "Place reference · official hours need checking"
          : "Official hours & visitor information"}{" "}
        ↗
      </a>
      <h3>When to go</h3>
      <p>{r.bestTime}</p>
      <p>
        Tax-free eligibility ·{" "}
        {r.taxFree ||
          "Needs check. Ask each store; no eligibility claim is made here."}
      </p>
      <YourNote id={r.id} />
      <Sources sources={r.sources} checkedOn={r.checkedOn} />
    </div>
  );
}
function YourNote({ id }: { id: string }) {
  const [score, setScore] = useState(5);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("No note saved yet.");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("jyw-note:" + id);
      const note = readNote(raw);
      if (note) {
        setScore(note.score);
        setText(note.text);
        setMessage("Your note · saved on this device.");
      } else if (raw)
        setMessage("The saved note could not be read. You can replace it.");
    } catch {
      setMessage(
        "This browser could not read saved notes. Your draft still works.",
      );
    }
  }, [id]);
  return (
    <section className="your-note">
      <h3>Your note</h3>
      <p>Private to this browser. Never included in public scores.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            localStorage.setItem(
              "jyw-note:" + id,
              JSON.stringify({ score, text }),
            );
            setMessage("Your note · saved on this device.");
          } catch {
            setMessage(
              "This browser could not save your note. Copy your text before leaving.",
            );
          }
        }}
      >
        <label>
          Your personal score
          <select
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </select>
        </label>
        <label>
          Your note
          <textarea
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Something to remember for your trip"
          />
        </label>
        <button className="button" type="submit">
          Save on this device
        </button>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            try {
              localStorage.removeItem("jyw-note:" + id);
              setText("");
              setScore(5);
              setMessage("Your saved note was removed.");
            } catch {
              setMessage("This browser could not remove the saved note.");
            }
          }}
        >
          Remove note
        </button>
      </form>
      <p role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}
