import type { Source } from "./explore";
export type Point = { x: number; y: number };
export type MapView = Point & { zoom: number };
export function panZoom(
  view: MapView,
  from: Point,
  to: Point,
  scale = 1,
): MapView {
  const zoom = Math.max(0.05, Math.min(4, view.zoom * scale));
  return {
    zoom,
    x: view.x + from.x / view.zoom - to.x / zoom,
    y: view.y + from.y / view.zoom - to.y / zoom,
  };
}
export interface MetroLine {
  id: string;
  city: string;
  nameEn: string;
  operator: string;
  code: string;
  stationIds: string[];
  extraEdges?: string[][];
  segments?: Point[][];
  loop?: boolean;
  sources: Source[];
  checkedOn: string;
}
export interface MetroStation {
  id: string;
  city: string;
  nameEn: string;
  nameJa?: string;
  codes: string[];
  lineIds: string[];
  interchangeIds?: string[];
  layout: { x: number; y: number; labelSide: string };
  sources: Source[];
  checkedOn: string;
}
export interface MetroData {
  lines: MetroLine[];
  stations: MetroStation[];
  layoutSource?: Source;
  layoutNote?: string;
}
export const cityNames = [
  "Sapporo",
  "Sendai",
  "Tokyo",
  "Yokohama",
  "Nagoya",
  "Kyoto",
  "Osaka",
  "Kobe",
  "Fukuoka",
  "Naha",
] as const;
export function octilinear(a: Point, b: Point) {
  return (
    a.x === b.x || a.y === b.y || Math.abs(a.x - b.x) === Math.abs(a.y - b.y)
  );
}
export function connectedPath(line: MetroLine) {
  return (line.segments || [])
    .map((points) =>
      points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" "),
    )
    .join(" ");
}
export function networkBounds(data: MetroData) {
  const xs = data.stations.map((s) => s.layout.x),
    ys = data.stations.map((s) => s.layout.y);
  return {
    x: Math.min(...xs) - 140,
    y: Math.min(...ys) - 140,
    width: Math.max(...xs) - Math.min(...xs) + 280,
    height: Math.max(...ys) - Math.min(...ys) + 280,
  };
}
export function fitNetwork(data: MetroData, width: number, height: number) {
  const b = networkBounds(data);
  const zoom = Math.min(width / b.width, height / b.height) * 0.91;
  return {
    x: b.x - (width / zoom - b.width) / 2,
    y: b.y - (height / zoom - b.height) / 2,
    zoom,
  };
}
export function metroGraph(data: MetroData) {
  const graph = new Map(data.stations.map((s) => [s.id, new Set<string>()]));
  const connect = (a: string, b: string) => {
    graph.get(a)?.add(b);
    graph.get(b)?.add(a);
  };
  data.lines.forEach((l) => {
    l.stationIds.slice(1).forEach((id, i) => connect(l.stationIds[i], id));
    l.extraEdges?.forEach(([a, b]) => connect(a, b));
  });
  data.stations.forEach((s) =>
    s.interchangeIds?.forEach((id) => connect(s.id, id)),
  );
  return graph;
}
export type SearchStation = Pick<
  MetroStation,
  "id" | "city" | "nameEn" | "codes"
>;
export function searchStations(
  data: { stations: SearchStation[] },
  q: string,
): SearchStation[] {
  const v = q.trim().toLowerCase();
  if (!v) return [];
  return data.stations
    .filter((s) =>
      [s.nameEn, ...s.codes].some((x) => x.toLowerCase().includes(v)),
    )
    .sort(
      (a, b) =>
        Number(!a.nameEn.toLowerCase().startsWith(v)) -
          Number(!b.nameEn.toLowerCase().startsWith(v)) ||
        a.nameEn.localeCompare(b.nameEn),
    )
    .slice(0, 8);
}
export function stationLink(id: string) {
  return `/metro/?station=${encodeURIComponent(id)}`;
}
export function projectJapan(lon: number, lat: number): Point {
  return { x: (lon - 127) * 105 + 40, y: (46 - lat) * 68 + 40 };
}
type Box = { left: number; right: number; top: number; bottom: number };
const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
export function labelBox(
  s: MetroStation,
  fontSize = 22,
  side = s.layout.labelSide,
) {
  const width = s.nameEn.length * fontSize * 0.56,
    height = fontSize * 1.25,
    p = s.layout,
    gap = fontSize * 0.7;
  const x =
      side === "w"
        ? p.x - gap - width
        : side === "e"
          ? p.x + gap
          : p.x - width / 2,
    y =
      side === "n"
        ? p.y - gap - height
        : side === "s"
          ? p.y + gap
          : p.y - height / 2;
  return { left: x, right: x + width, top: y, bottom: y + height };
}
export function segmentCrossesBox(a: Point, b: Point, box: Box) {
  // Liang–Barsky segment/rectangle clipping, including diagonal metro segments.
  let lo = 0,
    hi = 1;
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const ps = [-dx, dx, -dy, dy],
    qs = [a.x - box.left, box.right - a.x, a.y - box.top, box.bottom - a.y];
  for (let i = 0; i < 4; i++) {
    if (ps[i] === 0) {
      if (qs[i] < 0) return false;
    } else {
      const r = qs[i] / ps[i];
      if (ps[i] < 0) lo = Math.max(lo, r);
      else hi = Math.min(hi, r);
      if (lo > hi) return false;
    }
  }
  return true;
}
export function mapLabels(
  data: MetroData,
  zoom: number,
  view: { x: number; y: number },
  width: number,
  height: number,
) {
  const boxes: Box[] = [];
  const allSegments = data.lines.flatMap((l) =>
    (l.segments || []).flatMap((seg) =>
      seg.slice(1).map((p, i) => [seg[i], p] as const),
    ),
  );
  const fontSize = 14 / zoom;
  const ordered = [...data.stations].sort(
    (a, b) =>
      b.lineIds.length +
        (b.interchangeIds?.length || 0) -
        (a.lineIds.length + (a.interchangeIds?.length || 0)) ||
      a.nameEn.localeCompare(b.nameEn),
  );
  const labels: { station: MetroStation; box: Box; fontSize: number }[] = [];
  for (const station of ordered) {
    const p = station.layout;
    if (
      p.x < view.x ||
      p.x > view.x + width / zoom ||
      p.y < view.y ||
      p.y > view.y + height / zoom
    )
      continue;
    for (const side of ["e", "w", "n", "s"]) {
      const box = labelBox(station, fontSize, side);
      if (
        box.left < view.x + 8 / zoom ||
        box.right > view.x + (width - 8) / zoom ||
        box.top < view.y + 8 / zoom ||
        box.bottom > view.y + (height - 8) / zoom
      )
        continue;
      if (
        boxes.some((b) => overlaps(box, b)) ||
        allSegments.some(([a, b]) => segmentCrossesBox(a, b, box))
      )
        continue;
      boxes.push({
        ...box,
        left: box.left - 5 / zoom,
        right: box.right + 5 / zoom,
        top: box.top - 3 / zoom,
        bottom: box.bottom + 3 / zoom,
      });
      labels.push({ station, box, fontSize });
      break;
    }
  }
  return labels;
}
