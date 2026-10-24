import fs from "node:fs";
import path from "node:path";
import kanto from "../src/data/reviews/kanto.json";
import kansai from "../src/data/reviews/kansai.json";
import shopping from "../src/data/reviews/shopping.json";
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
import type { Restaurant } from "../src/lib/explore";
const result = validateExplore(
  [...kanto, ...kansai] as Restaurant[],
  shopping,
  [tokyo, osaka, kyoto, sapporo, sendai, yokohama, nagoya, kobe, fukuoka, naha],
  credits,
  (p) => fs.existsSync(path.resolve(p)),
);
result.errors.forEach((s) => console.error("ERROR", s));
if (result.warnings.length)
  console.warn(
    `${result.warnings.length} optional personal-use variants absent; the UI uses typographic placeholders.`,
  );
console.log(
  `${kanto.length + kansai.length} restaurants · ${shopping.length} shopping places · ${[tokyo, osaka, kyoto, sapporo, sendai, yokohama, nagoya, kobe, fukuoka, naha].reduce((s, n) => s + n.stations.length, 0)} stations · ${result.errors.length} errors`,
);
if (result.errors.length) process.exitCode = 1;
import national from "../src/data/metro/national.json";
import regions from "../src/data/regions.json";
import { validateNationwide } from "../src/lib/data-validation";
const nationwideErrors = validateNationwide(national, regions);
nationwideErrors.forEach((s) => console.error("ERROR", s));
if (nationwideErrors.length) process.exitCode = 1;
console.log(
  `${regions.length} regions · ${national.hubs.length} national hubs · ${national.routes.length} corridors · ${nationwideErrors.length} nationwide errors`,
);
