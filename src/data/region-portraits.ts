export const regionPortraits: Record<
  string,
  {
    image: string;
    alt: string;
    photoPlace: string;
    lead: string;
    highlights: { name: string; detail: string }[];
  }
> = {
  hokkaido: {
    image: "/images/regions/hokkaido.jpg",
    alt: "Odori Park running through central Sapporo with mountains beyond",
    photoPlace: "Odori Park · Sapporo",
    lead: "Begin in Sapporo for food and city life, then head into a northern landscape of ski slopes, flower fields and national parks.",
    highlights: [
      { name: "Sapporo", detail: "Ramen, markets and Odori Park" },
      { name: "Furano", detail: "Summer flower fields and mountain views" },
      { name: "Shiretoko", detail: "Wild peninsula and coastal scenery" },
    ],
  },
  tohoku: {
    image: "/images/regions/tohoku.jpg",
    alt: "Cherry blossoms overlooking the islands of Matsushima Bay in Miyagi",
    photoPlace: "Matsushima Bay · Miyagi",
    lead: "A slower journey through coastal views, mountain temples and festival towns, with Sendai as an easy city starting point.",
    highlights: [
      { name: "Matsushima", detail: "Pine-covered islands and bay views" },
      { name: "Hiraizumi", detail: "Historic temples and gardens" },
      { name: "Aomori", detail: "Nebuta culture and northern scenery" },
    ],
  },
  "hokuriku-shinetsu": {
    image: "/images/regions/hokuriku-shinetsu.jpg",
    alt: "Stone lantern beside the pond at Kenrokuen Garden in Kanazawa",
    photoPlace: "Kenrokuen · Kanazawa",
    lead: "Pair Kanazawa’s gardens and crafts with the Japan Alps, ski country and the Sea of Japan coast.",
    highlights: [
      { name: "Kanazawa", detail: "Kenrokuen, crafts and old districts" },
      { name: "Nagano", detail: "Alpine walks and mountain towns" },
      { name: "Niigata", detail: "Coastal food and sake traditions" },
    ],
  },
  kanto: {
    image: "/images/tokyo.webp",
    alt: "Nakamise shopping street leading toward Sensō-ji in Tokyo",
    photoPlace: "Asakusa · Tokyo",
    lead: "Move from Tokyo’s busy neighborhoods to Yokohama’s waterfront, then make time for shrines, trails and seaside towns nearby.",
    highlights: [
      { name: "Tokyo", detail: "Asakusa, gardens and city districts" },
      { name: "Nikkō", detail: "Ornate shrines in forested hills" },
      { name: "Kamakura", detail: "Temples and a coastal day out" },
    ],
  },
  tokai: {
    image: "/images/fuji-night-1920.webp",
    alt: "Chureito Pagoda and Mount Fuji above Fujiyoshida at dusk",
    photoPlace: "Mount Fuji · Yamanashi",
    lead: "Follow Mount Fuji into old streets, tea country and coastal roads, with Nagoya as a useful urban connection.",
    highlights: [
      { name: "Fuji Five Lakes", detail: "Views and walks beneath the mountain" },
      { name: "Takayama", detail: "Preserved streets in the Hida mountains" },
      { name: "Ise", detail: "Shrine town and peninsula coast" },
    ],
  },
  kansai: {
    image: "/images/kyoto.webp",
    alt: "Yasaka Pagoda above traditional streets in Kyoto",
    photoPlace: "Higashiyama · Kyoto",
    lead: "Connect Kyoto’s temple lanes, Osaka’s food streets and Nara’s historic parks in one region rich with easy side trips.",
    highlights: [
      { name: "Kyoto", detail: "Shrines, gardens and old neighborhoods" },
      { name: "Osaka", detail: "Dōtonbori and lively food culture" },
      { name: "Nara", detail: "Temple grounds and Nara Park" },
    ],
  },
  chugoku: {
    image: "/images/regions/chugoku.jpg",
    alt: "Itsukushima Shrine's torii standing in the water at Miyajima",
    photoPlace: "Miyajima · Hiroshima",
    lead: "Travel between Hiroshima’s history, the islands of the Seto Inland Sea and quieter towns along the western coast.",
    highlights: [
      { name: "Hiroshima", detail: "Peace Memorial Park and city life" },
      { name: "Miyajima", detail: "Itsukushima Shrine by the sea" },
      { name: "Tottori", detail: "Coastal dunes and wide horizons" },
    ],
  },
  shikoku: {
    image: "/images/regions/shikoku.jpg",
    alt: "A wooden bridge over the pond at Ritsurin Garden in Takamatsu",
    photoPlace: "Ritsurin Garden · Takamatsu",
    lead: "Explore a quieter island of gardens, udon, hot springs and the 88 Temple Pilgrimage, with coastal scenery between stops.",
    highlights: [
      { name: "Takamatsu", detail: "Ritsurin Garden and Kagawa udon" },
      { name: "Matsuyama", detail: "Dōgo Onsen and castle streets" },
      { name: "Tokushima", detail: "Awa Odori and pilgrimage routes" },
    ],
  },
  kyushu: {
    image: "/images/regions/kyushu.jpg",
    alt: "Green Mount Aso caldera landscape under a blue sky",
    photoPlace: "Mount Aso · Kumamoto",
    lead: "From Fukuoka’s food scene to Aso’s volcanic landscape and Beppu’s hot springs, Kyushu rewards an unhurried route.",
    highlights: [
      { name: "Fukuoka", detail: "Tonkotsu ramen and waterfront city life" },
      { name: "Mount Aso", detail: "Caldera landscapes and mountain views" },
      { name: "Beppu", detail: "Hot spring neighborhoods" },
    ],
  },
  okinawa: {
    image: "/images/regions/okinawa.jpg",
    alt: "Turquoise water, boats and green headlands at Kabira Bay on Ishigaki Island",
    photoPlace: "Kabira Bay · Ishigaki",
    lead: "Meet the Ryukyu islands through Naha’s streets, clear-water coastlines and a culture with its own distinct history.",
    highlights: [
      { name: "Naha", detail: "Kokusai-dōri and Ryukyu heritage" },
      { name: "Ishigaki", detail: "Kabira Bay and island landscapes" },
      { name: "Churaumi", detail: "Aquarium and northern main-island coast" },
    ],
  },
};
