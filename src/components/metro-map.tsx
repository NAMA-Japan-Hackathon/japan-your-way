"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Search, Maximize, ArrowUpRight } from "lucide-react";
import { Modal } from "./shared";
import { Sources } from "./explore-shared";
import {
  connectedPath,
  fitNetwork,
  mapLabels,
  projectJapan,
  searchStations,
  panZoom,
} from "@/lib/metro";
import type { MetroData, MetroStation, SearchStation } from "@/lib/metro";
import { networkLoaders } from "@/data/metro/loaders";
import national from "@/data/metro/national.json";
import coast from "@/data/metro/coastline.json";
export type NearbyPlace = {
  id: string;
  name: string;
  tab: string;
  stationIds: string[];
};
export type CitySummary = { city: string; lines: number; stations: number };
const patterns = ["", "12 4", "3 5", "14 4 3 4"];
const colors = [
  "var(--gold)",
  "var(--ink)",
  "var(--muted)",
  "var(--sage, #b8c7b8)",
];
type NationalHub = (typeof national.hubs)[number];
const empty: MetroData = { lines: [], stations: [] };
export function MetroMap({
  cities,
  stationIndex,
  nearby,
}: {
  cities: CitySummary[];
  stationIndex: SearchStation[];
  nearby: NearbyPlace[];
}) {
  const [city, setCity] = useState("Japan");
  const [data, setData] = useState<MetroData>(empty);
  const [visible, setVisible] = useState<string[]>([]);
  const [selected, setSelected] = useState<MetroStation | null>(null);
  const [hub, setHub] = useState<NationalHub | null>(null);
  const [highlight, setHighlight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusLine, setFocusLine] = useState("");
  const [q, setQ] = useState("");
  const [searchIndex, setSearchIndex] = useState(-1);
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [size, setSize] = useState({ width: 1000, height: 560 });
  const [regional, setRegional] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const cache = useRef<Record<string, MetroData>>({});
  const request = useRef(0);
  const drawn = useRef(new Set<string>());
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const prev = useRef<{ x: number; y: number; distance: number } | null>(null);
  const moved = useRef(false);
  const suggestions = searchStations(
    {
      stations: [
        ...stationIndex,
        ...national.hubs.map((h) => ({
          id: "hub-" + h.id,
          nameEn: h.name,
          city: "National rail hub",
          codes: [],
        })),
      ],
    },
    q,
  );
  const activeLines = useMemo(
    () => data.lines.filter((l) => visible.includes(l.id)),
    [data, visible],
  );
  const activeData = useMemo(
    () => ({ ...data, lines: activeLines }),
    [data, activeLines],
  );
  const labelData = useMemo(
    () =>
      focusLine
        ? {
            ...data,
            lines: data.lines.filter((l) => l.id === focusLine),
            stations: data.stations.filter((s) =>
              s.lineIds.includes(focusLine),
            ),
          }
        : activeData,
    [data, activeData, focusLine],
  );
  const labels = useMemo(
    () => mapLabels(labelData, view.zoom, view, size.width, size.height),
    [labelData, view, size],
  );
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  async function openCity(name: string, stationId?: string, write = true) {
    const ticket = ++request.current;
    setCity(name);
    setFocusLine("");
    setHighlight("");
    setQ("");
    setError("");
    setSelected(null);
    setHub(null);
    if (name === "Japan") {
      setData(empty);
      setLoading(false);
      if (write) history.pushState(null, "", "/metro/");
      return;
    }
    setLoading(true);
    try {
      const network = cache.current[name] || (await networkLoaders[name]());
      cache.current[name] = network;
      if (ticket !== request.current) return;
      setData(network);
      setVisible(network.lines.map((l) => l.id));
      const station = network.stations.find((s) => s.id === stationId);
      const bounds = stage.current?.getBoundingClientRect();
      const viewport = bounds
        ? { width: bounds.width, height: bounds.height }
        : size;
      setView(
        station
          ? {
              x: station.layout.x - viewport.width / 1.5 / 2,
              y: station.layout.y - viewport.height / 1.5 / 2,
              zoom: 1.5,
            }
          : fitNetwork(network, viewport.width, viewport.height),
      );
      if (station) {
        setSelected(station);
        setHighlight(station.id);
      }
      if (write)
        history.pushState(
          null,
          "",
          `/metro/?${stationId ? "station=" + encodeURIComponent(stationId) : "city=" + encodeURIComponent(name)}`,
        );
    } catch {
      if (ticket === request.current)
        setError(
          "This city network could not load. Your other maps are still available.",
        );
    } finally {
      if (ticket === request.current) setLoading(false);
    }
  }
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(location.search),
        id = p.get("station");
      const target = id ? stationIndex.find((s) => s.id === id) : undefined;
      const name = target?.city || p.get("city") || "Japan";
      if (name === "Japan" || name in networkLoaders)
        void openCity(name, id || undefined, false);
    };
    read();
    addEventListener("popstate", read);
    return () =>
      removeEventListener(
        "popstate",
        read,
      ); /* Hydrate static query routes once. */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function choose(s: SearchStation) {
    if (s.id.startsWith("hub-")) {
      const h = national.hubs.find((h) => h.id === s.id.slice(4));
      if (h) {
        const target = h.id === "naha" ? "Naha" : h.city;
        if (target && target in networkLoaders) void openCity(target);
        else {
          void openCity("Japan");
          setHub(h);
          setQ("");
        }
      }
    } else void openCity(s.city, s.id);
    setSearchIndex(-1);
  }
  function closeStation() {
    setSelected(null);
    history.replaceState(null, "", `/metro/?city=${city}`);
  }
  function reset() {
    if (city !== "Japan") {
      setFocusLine("");
      setView(fitNetwork(data, size.width, size.height));
    }
  }
  function traceLine(id: string) {
    setFocusLine(id);
    if (id && !visible.includes(id)) setVisible((v) => [...v, id]);
    const focused = id
      ? {
          ...data,
          stations: data.stations.filter((s) => s.lineIds.includes(id)),
        }
      : data;
    setView(fitNetwork(focused, size.width, size.height));
  }
  function zoom(
    factor: number,
    anchor = { x: size.width / 2, y: size.height / 2 },
  ) {
    setView((v) => panZoom(v, anchor, anchor, factor));
  }
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const wheel = (e: WheelEvent) => {
      if (city !== "Japan" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const r = node.getBoundingClientRect();
        zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, {
          x: e.clientX - r.left,
          y: e.clientY - r.top,
        });
      }
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, [size, city]);
  useEffect(() => {
    if (
      city === "Japan" ||
      loading ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let disposed = false;
    const tweens: { revert: () => void }[] = [];
    (async () => {
      const { gsap } = await import("gsap");
      if (disposed) return;
      svg.current
        ?.querySelectorAll<SVGPathElement>("[data-network-line]")
        .forEach((p) => {
          const id = p.dataset.networkLine!;
          if (drawn.current.has(id)) return;
          drawn.current.add(id);
          const length = p.getTotalLength();
          tweens.push(
            gsap.fromTo(
              p,
              { strokeDasharray: length, strokeDashoffset: length },
              {
                strokeDashoffset: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => {
                  gsap.set(p, {
                    clearProps: "strokeDasharray,strokeDashoffset",
                  });
                },
              },
            ),
          );
        });
    })();
    return () => {
      disposed = true;
      tweens.forEach((t) => t.revert());
    };
  }, [city, data, loading]);
  function pointerStart(e: React.PointerEvent) {
    if (
      city === "Japan" ||
      (e.target as Element).closest("[data-station],[data-network-line]")
    )
      return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stage.current?.setPointerCapture(e.pointerId);
    const ps = [...pointers.current.values()];
    prev.current = {
      x: ps.reduce((s, p) => s + p.x, 0) / ps.length,
      y: ps.reduce((s, p) => s + p.y, 0) / ps.length,
      distance:
        ps.length === 2 ? Math.hypot(ps[1].x - ps[0].x, ps[1].y - ps[0].y) : 0,
    };
    moved.current = false;
  }
  function pointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const ps = [...pointers.current.values()],
      x = ps.reduce((s, p) => s + p.x, 0) / ps.length,
      y = ps.reduce((s, p) => s + p.y, 0) / ps.length,
      distance =
        ps.length === 2 ? Math.hypot(ps[1].x - ps[0].x, ps[1].y - ps[0].y) : 0;
    const before = prev.current;
    if (before) {
      const dx = x - before.x,
        dy = y - before.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
      const bounds = stage.current!.getBoundingClientRect();
      setView((v) =>
        panZoom(
          v,
          { x: before.x - bounds.left, y: before.y - bounds.top },
          { x: x - bounds.left, y: y - bounds.top },
          distance && before.distance ? distance / before.distance : 1,
        ),
      );
    }
    prev.current = { x, y, distance };
  }
  function pointerEnd(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    prev.current = null;
  }
  const nodes = data.stations.filter(
    (s) =>
      s.lineIds.some((id) => visible.includes(id)) &&
      (!focusLine || s.lineIds.includes(focusLine)),
  );
  return (
    <section className="rail-atlas explore-wrap">
      <div className="atlas-toolbar">
        <div className="atlas-destinations">
          <button
            className={city === "Japan" ? "selected" : ""}
            onClick={() => void openCity("Japan")}
          >
            All Japan
          </button>
          <label htmlFor="city-network">
            City network
            <select
              id="city-network"
              value={city === "Japan" ? "" : city}
              onChange={(e) => void openCity(e.target.value || "Japan")}
            >
              <option value="">Choose a city</option>
              {cities.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city === "Naha" ? "Okinawa · Naha" : c.city} · {c.lines}{" "}
                  lines
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="station-search">
          <label htmlFor="station-search">
            <Search size={18} /> Find a station across Japan
          </label>
          <input
            id="station-search"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="station-suggestions"
            aria-expanded={suggestions.length > 0}
            aria-activedescendant={
              searchIndex >= 0 ? `suggestion-${searchIndex}` : undefined
            }
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchIndex(-1);
            }}
            placeholder="Station name or city line code"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSearchIndex((i) => Math.min(i + 1, suggestions.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSearchIndex((i) => Math.max(0, i - 1));
              } else if (
                e.key === "Enter" &&
                suggestions[searchIndex >= 0 ? searchIndex : 0]
              ) {
                e.preventDefault();
                choose(suggestions[searchIndex >= 0 ? searchIndex : 0]);
              } else if (e.key === "Escape") setQ("");
            }}
          />
          {suggestions.length > 0 && (
            <ul id="station-suggestions" role="listbox">
              {suggestions.map((s, i) => (
                <li
                  id={"suggestion-" + i}
                  key={s.id}
                  role="option"
                  aria-selected={i === searchIndex}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(s)}
                >
                  {s.nameEn}
                  <span>
                    {s.city} · {s.codes.join(" / ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="atlas-frame">
        <aside className="atlas-sidebar">
          <div>
            <p className="atlas-eyebrow">
              {city === "Japan" ? "From north to south" : "City rail network"}
            </p>
            <h2>
              {city === "Japan"
                ? "Japan, connected."
                : city === "Naha"
                  ? "Okinawa · Naha"
                  : city}
            </h2>
            <p>
              {city === "Japan"
                ? "Follow a rail corridor. Choose a city. Leave room for somewhere unexpected."
                : `${data.lines.filter((l) => l.code !== "m").length} lines${data.lines.some((l) => l.code === "m") ? " + branch" : ""} · ${data.stations.length} stations. Shared nodes mark interchanges.`}
            </p>
          </div>
          {city === "Japan" ? (
            <>
              <div className="rail-type-key">
                <span>
                  <i /> Shinkansen
                </span>
                <label>
                  <input
                    type="checkbox"
                    checked={regional}
                    onChange={(e) => setRegional(e.target.checked)}
                  />
                  <i /> Regional corridors
                </label>
              </div>
              <div className="atlas-city-list">
                {cities.map((c) => (
                  <button key={c.city} onClick={() => void openCity(c.city)}>
                    {c.city === "Naha" ? "Okinawa · Naha" : c.city}
                    <span>
                      {c.stations} stations <ArrowUpRight size={15} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="atlas-line-list">
              <label className="trace-line" htmlFor="trace-line">
                Trace a line
                <select
                  id="trace-line"
                  value={focusLine}
                  onChange={(e) => traceLine(e.target.value)}
                >
                  <option value="">Full network</option>
                  {data.lines.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.code} · {l.nameEn}
                    </option>
                  ))}
                </select>
              </label>
              <p>Show lines</p>
              {data.lines.map((l, i) => (
                <label key={l.id}>
                  <input
                    type="checkbox"
                    checked={visible.includes(l.id)}
                    onChange={() =>
                      setVisible(
                        visible.includes(l.id)
                          ? visible.filter((id) => id !== l.id)
                          : [...visible, l.id],
                      )
                    }
                  />
                  <svg width="26" height="8" aria-hidden="true">
                    <path
                      d="M0 4H26"
                      stroke={colors[i % 4]}
                      strokeWidth="3"
                      strokeDasharray={patterns[Math.floor(i / 4) % 4]}
                    />
                  </svg>
                  <strong>{l.code}</strong>
                  <span>{l.nameEn}</span>
                </label>
              ))}
            </div>
          )}
          <a href="#station-lists" className="atlas-text-link">
            Read the station lists ↓
          </a>
        </aside>
        <div>
          <div
            className={`metro-stage connected-stage ${city === "Japan" ? "national-stage" : ""}`}
            ref={stage}
            tabIndex={0}
            role="region"
            aria-label={`${city} rail map. City maps: arrow keys pan; plus and minus zoom; zero fits the network. Complete text lists follow below.`}
            onPointerDown={pointerStart}
            onPointerMove={pointerMove}
            onPointerUp={pointerEnd}
            onPointerCancel={pointerEnd}
            onKeyDown={(e) => {
              if ((e.target as Element).closest("[data-station]")) return;
              if (city === "Japan") return;
              const delta = 70 / view.zoom;
              if (
                [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "+",
                  "=",
                  "-",
                  "0",
                ].includes(e.key)
              ) {
                e.preventDefault();
                if (e.key === "+" || e.key === "=") zoom(1.2);
                else if (e.key === "-") zoom(1 / 1.2);
                else if (e.key === "0") reset();
                else
                  setView((v) => ({
                    ...v,
                    x:
                      v.x +
                      (e.key === "ArrowRight"
                        ? delta
                        : e.key === "ArrowLeft"
                          ? -delta
                          : 0),
                    y:
                      v.y +
                      (e.key === "ArrowDown"
                        ? delta
                        : e.key === "ArrowUp"
                          ? -delta
                          : 0),
                  }));
              }
            }}
          >
            {city === "Japan" ? (
              <NationalMap
                regional={regional}
                onHub={(h) => {
                  const city = h.city === "Naha / Okinawa" ? "Naha" : h.city;
                  if (city && city in networkLoaders) void openCity(city);
                  else setHub(h);
                }}
              />
            ) : loading ? (
              <div className="map-loading" role="status">
                Loading {city} network…
              </div>
            ) : error ? (
              <div className="map-loading" role="alert">
                <p>{error}</p>
                <button className="button" onClick={() => void openCity(city)}>
                  Retry network
                </button>
              </div>
            ) : (
              <svg
                ref={svg}
                className="connected-svg"
                width="100%"
                height="100%"
                viewBox={`${view.x} ${view.y} ${size.width / view.zoom} ${size.height / view.zoom}`}
                aria-label={`${city} connected schematic network`}
              >
                {activeLines.map((l) => {
                  const i = data.lines.indexOf(l);
                  return (
                    <path
                      key={l.id}
                      data-network-line={l.id}
                      d={connectedPath(l)}
                      className="network-line"
                      stroke={colors[i % 4]}
                      strokeDasharray={patterns[Math.floor(i / 4) % 4]
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => Number(n) / view.zoom)
                        .join(" ")}
                      style={{
                        strokeWidth: (focusLine === l.id ? 3.5 : 2) / view.zoom,
                        opacity: focusLine && focusLine !== l.id ? 0.06 : 1,
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Trace ${l.nameEn}`}
                      onClick={() => traceLine(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          traceLine(l.id);
                        }
                      }}
                    />
                  );
                })}
                {data.stations.flatMap((s) =>
                  (s.interchangeIds || [])
                    .filter((id) => id > s.id)
                    .map((id) => {
                      const other = data.stations.find((s) => s.id === id)!;
                      return (
                        <path
                          key={s.id + id}
                          d={`M${s.layout.x},${s.layout.y}L${other.layout.x},${other.layout.y}`}
                          stroke="var(--muted)"
                          strokeWidth={1 / view.zoom}
                          strokeDasharray={`${4 / view.zoom} ${4 / view.zoom}`}
                          fill="none"
                        />
                      );
                    }),
                )}
                {nodes.map((s) => (
                  <g
                    key={s.id}
                    data-station
                    role="button"
                    tabIndex={0}
                    aria-label={`${s.nameEn}, ${s.codes.join(", ")}${s.lineIds.length > 1 ? ", interchange" : ""}`}
                    onClick={() => {
                      if (!moved.current) {
                        setSelected(s);
                        setHighlight(s.id);
                        history.pushState(null, "", `/metro/?station=${s.id}`);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(s);
                        setHighlight(s.id);
                        history.pushState(null, "", `/metro/?station=${s.id}`);
                      }
                    }}
                  >
                    <title>
                      {s.nameEn} · {s.codes.join(" / ")}
                    </title>
                    <circle
                      className="station-hit"
                      cx={s.layout.x}
                      cy={s.layout.y}
                      r={22 / view.zoom}
                    />
                    <circle
                      className={`connected-node ${highlight === s.id ? "highlighted" : ""}`}
                      cx={s.layout.x}
                      cy={s.layout.y}
                      r={(s.lineIds.length > 1 ? 3.8 : 2.3) / view.zoom}
                      strokeWidth={1.5 / view.zoom}
                    />
                    {s.lineIds.length > 1 && (
                      <circle
                        cx={s.layout.x}
                        cy={s.layout.y}
                        r={2 / view.zoom}
                        fill="var(--ink)"
                      />
                    )}
                  </g>
                ))}
                {labels.map(({ station, box, fontSize }) => (
                  <text
                    key={station.id}
                    x={box.left}
                    y={box.bottom - fontSize * 0.22}
                    fill="var(--ink)"
                    fontSize={fontSize}
                    className="network-label"
                  >
                    {station.nameEn}
                  </text>
                ))}
              </svg>
            )}
            {city !== "Japan" && !loading && (
              <div className="map-controls">
                <button onClick={() => zoom(1.3)} aria-label="Zoom in">
                  <Plus />
                </button>
                <button onClick={() => zoom(1 / 1.3)} aria-label="Zoom out">
                  <Minus />
                </button>
                <button onClick={reset} aria-label="Fit full network">
                  <Maximize />
                </button>
              </div>
            )}
            <div className="map-caption">
              {city === "Japan"
                ? "National rail overview · selected hubs"
                : focusLine
                  ? `${data.lines.find((l) => l.id === focusLine)?.nameEn} · traced line`
                  : "Connected schematic · choose a line to trace"}
            </div>
          </div>
          <p className="map-instructions">
            {city === "Japan"
              ? "Select a marked hub or choose any of the ten city networks. Intermediate stops are omitted from the national view."
              : "Trace a line to see its stops clearly. Drag / pinch to explore; + / − zoom; 0 fits all. Normal wheel scrolls the page; Ctrl / ⌘ + wheel zooms."}
          </p>
        </div>
      </div>
      <p className="atlas-coverage" role="status" aria-live="polite">
        {city === "Japan"
          ? `${national.hubs.length} national hubs · ${national.routes.length} major rail corridors · ${cities.length} detailed city networks · ${cities.reduce((s, c) => s + c.stations, 0)} city stations`
          : `${activeLines.length} lines shown in ${city} · ${labels.length} readable labels at this zoom. Search finds every included station.`}
      </p>
      {selected && (
        <Modal title={selected.nameEn} onClose={closeStation}>
          <div className="station-detail">
            <p>
              {selected.city} · {selected.codes.join(" / ")}
            </p>
            {selected.nameJa ? (
              <p className="show-to-staff" lang="ja">
                {selected.nameJa}
              </p>
            ) : (
              <p>
                Japanese name · Needs check. Use the station code when asking
                staff.
              </p>
            )}
            <h3>Lines & interchanges</h3>
            <ul>
              {selected.lineIds.map((id) => {
                const l = data.lines.find((l) => l.id === id)!;
                return (
                  <li key={id}>
                    {l.code} · {l.nameEn} · {l.operator}
                  </li>
                );
              })}
            </ul>
            {selected.interchangeIds?.map((id) => {
              const s = data.stations.find((s) => s.id === id)!;
              return (
                <p key={id}>
                  <button
                    className="button secondary"
                    onClick={() => {
                      setSelected(s);
                      setHighlight(s.id);
                      history.replaceState(null, "", `/metro/?station=${s.id}`);
                    }}
                  >
                    {s.nameEn} · connected station
                  </button>
                </p>
              );
            })}
            <p>
              Follow operator transfer signs. Walking and accessible routes need
              checking.
            </p>
            <h3>Nearby places</h3>
            {nearby.filter((p) => p.stationIds.includes(selected.id)).length ? (
              <ul>
                {nearby
                  .filter((p) => p.stationIds.includes(selected.id))
                  .map((p) => (
                    <li key={p.id}>
                      <Link href={`/reviews/?tab=${p.tab}&place=${p.id}`}>
                        {p.name} ↗
                      </Link>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>
                No place in the catalogue has a verified nearby-station link
                yet.
              </p>
            )}
            <button
              className="button"
              onClick={() => {
                setView({
                  x: selected.layout.x - size.width / 1.5 / 2,
                  y: selected.layout.y - size.height / 1.5 / 2,
                  zoom: 1.5,
                });
                closeStation();
              }}
            >
              Show this area on the map
            </button>
            <Sources
              sources={selected.sources}
              checkedOn={selected.checkedOn}
            />
          </div>
        </Modal>
      )}
      {hub && (
        <Modal title={hub.name} onClose={() => setHub(null)}>
          <p>
            This hub is part of the wider Japan rail overview. Detailed local
            station maps are not included for every destination yet.
          </p>
          <h3>Rail corridors</h3>
          <ul>
            {national.routes
              .filter((r) => r.hubIds.includes(hub.id))
              .map((r) => (
                <li key={r.id}>{r.name}</li>
              ))}
          </ul>
          <p>
            These are corridors, not a timetable or a promise of a direct train.
            Confirm your journey with the operator.
          </p>
          <a
            className="button"
            href={national.sources[0].url}
            target="_blank"
            rel="noreferrer"
          >
            Official Japan rail reference ↗
          </a>
          <Sources sources={national.sources} checkedOn={national.checkedOn} />
        </Modal>
      )}
    </section>
  );
}
function NationalMap({
  regional,
  onHub,
}: {
  regional: boolean;
  onHub: (hub: NationalHub) => void;
}) {
  const hubs = new Map(national.hubs.map((h) => [h.id, h]));
  const main = [
    "sapporo",
    "shin-hakodate-hokuto",
    "sendai",
    "niigata",
    "kanazawa",
    "tokyo",
    "nagoya",
    "shin-osaka",
    "hiroshima",
    "hakata",
    "kagoshima-chuo",
  ];
  const coastPath = coast.geometry.coordinates
    .map((poly) =>
      poly
        .map(
          (ring) =>
            ring
              .map(([lon, lat], i) => {
                const p = projectJapan(lon, lat);
                return `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(" ") + "Z",
        )
        .join(" "),
    )
    .join(" ");
  return (
    <svg
      className="national-map"
      viewBox="200 0 1770 1130"
      role="group"
      aria-label="Rail corridors across Japan, from Hokkaido through Honshu, Shikoku and Kyushu, with Okinawa shown separately."
    >
      <path className="japan-land" d={coastPath} />
      <text className="island-label" x="1550" y="110">
        HOKKAIDO
      </text>
      {national.routes
        .filter((r) => regional || r.kind === "shinkansen")
        .map((r) => (
          <path
            key={r.id}
            className={`national-route ${r.kind}`}
            d={r.hubIds
              .map((id, i) => {
                const h = hubs.get(id)!,
                  p = projectJapan(h.lon, h.lat);
                return `${i ? "L" : "M"}${p.x},${p.y}`;
              })
              .join(" ")}
          >
            <title>{r.name}</title>
          </path>
        ))}
      {national.hubs
        .filter((h) => h.id !== "naha")
        .map((h) => {
          const p = projectJapan(h.lon, h.lat);
          return (
            <g
              key={h.id}
              role="button"
              tabIndex={0}
              aria-label={`${h.name}${h.city ? " · open city network" : ""}`}
              className="national-hub"
              onClick={() => onHub(h)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onHub(h);
                }
              }}
            >
              <title>{h.name}</title>
              <circle className="national-hit" cx={p.x} cy={p.y} r="23" />
              <circle
                cx={p.x}
                cy={p.y}
                r={h.city ? 8 : 4}
                className={h.city ? "major" : "minor"}
              />
              {main.includes(h.id) && (
                <text
                  x={p.x + (h.id === "shin-hakodate-hokuto" ? -16 : 16)}
                  y={
                    p.y +
                    (h.id === "kyoto" ? -24 : h.id === "shin-osaka" ? 35 : 10)
                  }
                  textAnchor={h.id === "shin-hakodate-hokuto" ? "end" : "start"}
                >
                  {h.name}
                </text>
              )}
            </g>
          );
        })}
      <g
        className="okinawa-inset national-hub"
        transform="translate(0 90)"
        role="button"
        tabIndex={0}
        aria-label="Okinawa · open Naha city network"
        onClick={() => onHub(national.hubs.find((h) => h.id === "naha")!)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onHub(national.hubs.find((h) => h.id === "naha")!);
          }
        }}
      >
        <rect
          x="230"
          y="60"
          width="530"
          height="200"
          fill="var(--ground)"
          rx="12"
        />
        <text x="265" y="125">
          Okinawa · Naha ↗
        </text>
        <text className="national-note" x="265" y="180">
          Yui Rail · island network
        </text>
        <text className="national-note" x="265" y="225">
          No mainland rail link
        </text>
      </g>
    </svg>
  );
}
