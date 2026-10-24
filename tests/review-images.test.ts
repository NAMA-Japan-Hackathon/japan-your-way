import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import kanto from "../src/data/reviews/kanto.json";
import kansai from "../src/data/reviews/kansai.json";
import shopping from "../src/data/reviews/shopping.json";
import credits from "../public/images/credits.json";
import type { ImageRef } from "../src/lib/explore";

const records = [...kanto, ...kansai, ...shopping];

test("every review has a working local image and a bundled contextual fallback", () => {
  const creditRefs = new Set(credits.map((credit) => credit.ref));
  const trackedAreaPhotos = new Set([
    "/images/tokyo.webp",
    "/images/gion.webp",
    "/images/osaka.webp",
  ]);
  for (const record of records) {
    const image = record.image as ImageRef;
    assert.ok(image?.src, `${record.id} needs an image`);
    assert.ok(image.alt, `${record.id} needs descriptive alt text`);
    assert.ok(
      creditRefs.has(image.credit),
      `${record.id} needs image provenance`,
    );
    const variants = image.responsive
      ? [640, 1280, 1920].map((width) =>
          image.src.replace("-1280", `-${width}`),
        )
      : [image.src];
    for (const source of variants) {
      // Optional venue photographs are intentionally absent from a public clone.
      if (
        source.startsWith("/images/personal-use/") &&
        !fs.existsSync(path.join(process.cwd(), "public", source))
      )
        continue;
      assert.ok(
        fs.statSync(path.join(process.cwd(), "public", source)).size > 1000,
        `${record.id}: ${source} must contain a photograph`,
      );
    }
    assert.ok(
      image.fallback && trackedAreaPhotos.has(image.fallback.src),
      `${record.id} needs a portable fallback`,
    );
    assert.ok(
      image.fallback.alt && image.fallback.label.includes("illustrative"),
    );
    assert.ok(
      fs.statSync(path.join(process.cwd(), "public", image.fallback.src)).size >
        1000,
    );
    if (record.id.startsWith("food-") && trackedAreaPhotos.has(image.src)) {
      assert.ok(
        image.contextLabel?.includes("illustrative"),
        `${record.id}: do not present an area photograph as the venue`,
      );
    }
  }
});

import { safeHotelImage, validSearches } from "../src/lib/travel";
import { hotelOffers, liteOffers } from "../src/lib/travel-search.server";

test("hotel photographs accept public HTTPS only and reject secrets or local addresses", () => {
  const image = "https://images.example.com/tokyo-hotel.jpg";
  assert.equal(safeHotelImage(image), image);
  for (const source of [
    "http://images.example.com/photo.jpg",
    "https://" + "user:password@" + "images.example.com/a.jpg",
    "https://127.0.0.1/a.jpg",
    "https://192.168.0.1/a.jpg",
    "https://[::1]/a.jpg",
    "https://hotel.local/a.jpg",
    "https://images.example.com/a.jpg?api_key=private",
    "https://images.example.com/a.jpg?token=private",
  ])
    assert.equal(safeHotelImage(source), undefined);
  const offers = hotelOffers(
    {
      properties: [
        {
          name: "Tokyo hotel",
          total_rate: { extracted_lowest: 10000 },
          images: [{ original_image: image }],
        },
      ],
    },
    "https://www.google.com/travel/hotels",
  );
  assert.equal(offers[0].imageUrl, image);
  const result = {
    kind: "hotel",
    title: "Tokyo",
    scope: "One room",
    note: "Snapshot",
    status: "found",
    checkedAt: new Date().toISOString(),
    offers,
  };
  assert.equal(validSearches([result]), true);
  assert.equal(
    validSearches([
      {
        ...result,
        offers: [{ ...offers[0], imageUrl: "https://hotel.local/private.jpg" }],
      },
    ]),
    false,
  );
  assert.equal(
    validSearches([
      { ...result, offers: [{ ...offers[0], imageUrl: undefined }] },
    ]),
    true,
  );
  const lite = liteOffers(
    {
      hotels: [{ id: "one", name: "Tokyo hotel", main_photo: image }],
      data: [
        {
          hotelId: "one",
          roomTypes: [
            { offerRetailRate: { amount: 10000, currency: "INR" }, rates: [] },
          ],
        },
      ],
    },
    "https://www.google.com/travel/hotels",
    true,
  );
  assert.equal(lite[0].imageUrl, image);
});
