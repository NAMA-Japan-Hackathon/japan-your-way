import { test } from "node:test";
import assert from "node:assert/strict";
import regions from "../src/data/regions.json";
import { regionActivityIdeas } from "../src/data/japan-activities";
import { activityPrefectures } from "../src/data/activity-prefectures";

test("every curated activity is assigned to a prefecture in its region", () => {
  const titles = new Set<string>();
  for (const region of regions) {
    for (const idea of regionActivityIdeas[region.id]) {
      assert.ok(!titles.has(idea.title), `duplicate activity: ${idea.title}`);
      titles.add(idea.title);
      const places = activityPrefectures[idea.title];
      assert.ok(places?.length, `missing prefecture: ${idea.title}`);
      for (const place of places) {
        assert.ok(region.prefectures.includes(place), `${idea.title} has ${place} outside ${region.name}`);
      }
    }
  }
  assert.deepEqual(Object.keys(activityPrefectures).sort(), [...titles].sort());
});
