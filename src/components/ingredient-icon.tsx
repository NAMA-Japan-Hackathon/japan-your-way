import { ingredientName } from "@/data/allergens";
// Original 24px monochrome drawings. Related foods share a visual family, never a color-only code.
const drawings: Record<string, string> = {
  egg: "M12 3C8 3 5 12 5 15a7 7 0 0 0 14 0C19 12 16 3 12 3Z M9 15c0 2 1 3 3 3",
  milk: "M8 3h8v4l2 3v11H6V10l2-3V3Z M8 7h8 M6 12h12",
  wheat:
    "M12 22V4 M12 8C6 8 6 3 6 3s6 0 6 5Zm0 6C6 14 6 9 6 9s6 0 6 5Zm0-3c6 0 6-5 6-5s-6 0-6 5Zm0 6c6 0 6-5 6-5s-6 0-6 5Z",
  buckwheat: "M12 3 3 19h18L12 3Z M12 3v16 M3 19l9-7 9 7",
  peanut:
    "M9 3c-5 0-6 6-3 9-3 3-2 9 3 9 3 0 3-3 6-3 5 0 7-6 3-9 3-5-2-8-5-5-1 1-2 0-4-1Z M8 8l2 2m-3 6 2-2m6-1 2 2",
  shrimp:
    "M5 7c8-5 17 1 14 9-2 6-11 6-12 0-1-4 5-7 8-4 M7 16l8-4 M8 20l9-5 M19 16l3 3 M5 7 2 4m3 3L2 8",
  crab: "M6 12c0-5 12-5 12 0v3c0 7-12 7-12 0v-3Z M8 9V6m8 3V6 M6 13 2 10V5l3 2 M18 13l4-3V5l-3 2 M6 16l-4 2m16-2 4 2M8 20l-3 2m11-2 3 2",
  walnut:
    "M12 3c-9-2-13 18 0 18 13 0 9-20 0-18Z M12 3v18 M8 7l-2 4 2 3-1 3m9-10 2 4-2 3 1 3",
  cashew: "M15 3C4-1 0 14 7 20c4 3 8-1 6-4-2-2-4-3-2-6 2-2 9-3 4-7Z",
  sesame: "M7 4C0 11 3 16 7 16s7-5 0-12Z M16 10c-7 7-4 12 0 12s7-5 0-12Z",
  soy: "M3 19C3 5 17 1 21 3c0 13-12 21-18 16Z M7 15a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M12 9a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  almond: "M12 2C0 9 3 20 12 22c9-2 12-13 0-20Z M12 6v12",
  fish: "M3 12c5-9 13-9 16 0-3 9-11 9-16 0Z M19 12l4-5v10l-4-5 M7 11h.1",
  squid:
    "M12 2 6 11v5h12v-5L12 2Z M7 16l-3 6m6-6-1 6m4-6 1 6m3-6 3 6 M9 12h.1m6 0h.1",
  pork: "M5 7 3 3l6 3h6l6-3-2 5v8c-1 7-13 7-14 0V7Z M8 13h8v5H8Z M10 15v1m4-1v1 M7 9h.1m10 0h.1",
  beef: "M6 8C2 8 1 4 3 2l4 4h10l4-4c2 2 1 6-3 6v9c-2 5-10 5-12 0V8Z M8 14h8v5H8Z M8 10h.1m8 0h.1",
  chicken:
    "M6 17c-7-8 2-15 9-9l2-3 4 1-2 3 3 3-5 2c-1 8-8 9-11 3Z M8 12c-2 4 2 6 5 3 M16 8h.1",
  gelatin: "M4 9 12 4l8 5v10H4V9Z M4 9h16 M8 9v10m8-10v10 M6 13h12",
  alcohol: "M9 2h6v7l3 4v9H6v-9l3-4V2Z M9 6h6 M6 14h12 M10 17h4",
  "fish-stock":
    "M3 13h18c0 11-18 11-18 0Z M8 10c-4-3 3-4 0-7m8 7c-4-3 3-4 0-7 M6 17h12",
  apple:
    "M12 7C5 2 0 12 5 19c2 4 5 1 7 2 2-1 5 2 7-2 5-7 0-17-7-12Z M12 7V2l5 1-5 4",
  banana: "M4 4c2 15 13 16 16 3 3 15-16 20-18 2l2-5Z",
  orange:
    "M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z M12 5V2l5 1-5 2 M7 12h.1m3-3h.1m6 6h.1",
  kiwi: "M4 6c5-7 18 0 16 8-1 9-17 10-18 0-1-3 0-5 2-8Z M12 8v10m-5-5h10 M8 9l8 8m0-8-8 8",
  peach:
    "M12 7C5-2-2 12 5 19c4 4 10 4 14 0 7-7 0-21-7-12Z M12 7c-3 4 4 8 0 13 M12 6l6-4",
  yam: "M6 4c7-5 17 8 13 15-5 6-18-8-16-12l3-3Z M7 8l2 1m1 4 2 1m2 3 2 1",
  pistachio: "M12 3C0 5 0 22 12 22c12 0 12-17 0-19Z M12 3l-3 9 3 10 3-10-3-9Z",
  macadamia: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M6 5l6 7-3 9",
  abalone:
    "M3 17C-1 6 15-1 21 8c6 10-13 18-18 9Z M6 15c-3-5 8-10 11-5s-9 10-11 5Z",
  "salmon-roe":
    "M8 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M17 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M8 15a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
};
export function IngredientIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={ingredientName(name)}
    >
      <title>{ingredientName(name)}</title>
      <path d={drawings[name] || drawings.fish} />
    </svg>
  );
}
