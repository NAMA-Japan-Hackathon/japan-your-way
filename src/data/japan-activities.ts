export const activityFilters = [
  { id: "all", label: "All activities" },
  { id: "culture", label: "Culture & history" },
  { id: "food", label: "Food & drink" },
  { id: "nature", label: "Nature & scenery" },
  { id: "outdoors", label: "Outdoor adventures" },
  { id: "shopping", label: "Shopping" },
  { id: "arts", label: "Art & crafts" },
  { id: "festivals", label: "Festivals" },
  { id: "wellness", label: "Hot springs" },
  { id: "coast", label: "Coast & islands" },
  { id: "family", label: "Family attractions" },
  { id: "nightlife", label: "Nightlife" },
] as const;

export type ActivityFilter = (typeof activityFilters)[number]["id"];
type ActivityCategory = Exclude<ActivityFilter, "all">;

type ActivityIdea = {
  title: string;
  place: string;
  category: ActivityCategory;
};

export const regionActivityIdeas: Record<string, ActivityIdea[]> = {
  hokkaido: [
    { title: "Ski and snowboard", place: "Niseko", category: "outdoors" },
    { title: "Taste Sapporo ramen", place: "Sapporo", category: "food" },
    { title: "Explore Shiretoko", place: "Shiretoko", category: "nature" },
    { title: "See Furano's flower fields", place: "Furano", category: "nature" },
    { title: "Visit the Snow Festival", place: "Sapporo", category: "festivals" },
    { title: "Learn about Ainu culture", place: "Upopoy · Shiraoi", category: "culture" },
    { title: "Explore after dark", place: "Susukino · Sapporo", category: "nightlife" },
  ],
  tohoku: [
    { title: "Cruise among pine islands", place: "Matsushima Bay", category: "coast" },
    { title: "Climb to Yamadera", place: "Yamagata", category: "culture" },
    { title: "See the Nebuta festival", place: "Aomori", category: "festivals" },
    { title: "Ski the Zao mountains", place: "Yamagata · Miyagi", category: "outdoors" },
    { title: "Soak in a mountain town", place: "Ginzan Onsen", category: "wellness" },
    { title: "Walk beneath cherry blossoms", place: "Hirosaki", category: "nature" },
  ],
  "hokuriku-shinetsu": [
    { title: "Wander Kenrokuen Garden", place: "Kanazawa", category: "nature" },
    { title: "Try traditional crafts", place: "Kanazawa", category: "arts" },
    { title: "Cross the Japan Alps", place: "Tateyama Kurobe", category: "outdoors" },
    { title: "Taste local sake", place: "Niigata", category: "food" },
    { title: "Relax in a hot spring", place: "Kaga Onsen", category: "wellness" },
    { title: "Explore an island coast", place: "Sado Island", category: "coast" },
  ],
  kanto: [
    { title: "Visit Sensō-ji", place: "Asakusa · Tokyo", category: "culture" },
    { title: "Browse fashion streets", place: "Shibuya · Tokyo", category: "shopping" },
    { title: "Eat through an outer market", place: "Tsukiji · Tokyo", category: "food" },
    { title: "See forested shrines", place: "Nikkō", category: "culture" },
    { title: "Soak by Lake Ashi", place: "Hakone", category: "wellness" },
    { title: "Discover remote islands", place: "Ogasawara", category: "coast" },
    { title: "Visit Tokyo Disney Resort", place: "Urayasu · Chiba", category: "family" },
  ],
  tokai: [
    { title: "See Mount Fuji's lakes", place: "Yamanashi", category: "nature" },
    { title: "Hike Mount Fuji", place: "Yamanashi · Shizuoka", category: "outdoors" },
    { title: "Walk an old town", place: "Takayama", category: "culture" },
    { title: "Taste Japanese tea", place: "Shizuoka", category: "food" },
    { title: "Browse city shops", place: "Nagoya", category: "shopping" },
    { title: "Visit Ise's shrines", place: "Mie", category: "culture" },
  ],
  kansai: [
    { title: "Visit shrines and temples", place: "Kyoto", category: "culture" },
    { title: "Try Osaka street food", place: "Dōtonbori · Osaka", category: "food" },
    { title: "Stroll historic parkland", place: "Nara", category: "nature" },
    { title: "Experience Gion Matsuri", place: "Kyoto", category: "festivals" },
    { title: "Shop by the harbor", place: "Kobe", category: "shopping" },
    { title: "Visit a hot spring town", place: "Kinosaki Onsen", category: "wellness" },
    { title: "Spend a day at Universal Studios", place: "Osaka", category: "family" },
    { title: "See Osaka after dark", place: "Dōtonbori", category: "nightlife" },
  ],
  chugoku: [
    { title: "Visit Peace Memorial Park", place: "Hiroshima", category: "culture" },
    { title: "See Itsukushima Shrine", place: "Miyajima", category: "coast" },
    { title: "Walk the sand dunes", place: "Tottori", category: "outdoors" },
    { title: "Explore art and old streets", place: "Kurashiki", category: "arts" },
    { title: "Wander Kōrakuen Garden", place: "Okayama", category: "nature" },
    { title: "Try Hiroshima okonomiyaki", place: "Hiroshima", category: "food" },
  ],
  shikoku: [
    { title: "Follow temple paths", place: "88 Temple Pilgrimage", category: "culture" },
    { title: "Soak at Dōgo Onsen", place: "Matsuyama", category: "wellness" },
    { title: "Stroll Ritsurin Garden", place: "Takamatsu", category: "nature" },
    { title: "Taste Sanuki udon", place: "Kagawa", category: "food" },
    { title: "Watch Awa Odori", place: "Tokushima", category: "festivals" },
    { title: "Cross the Iya Valley", place: "Tokushima", category: "outdoors" },
  ],
  kyushu: [
    { title: "Explore Mount Aso", place: "Kumamoto", category: "outdoors" },
    { title: "Visit Beppu's hot springs", place: "Ōita", category: "wellness" },
    { title: "Eat at a yatai stall", place: "Fukuoka", category: "food" },
    { title: "Trace port-city history", place: "Nagasaki", category: "culture" },
    { title: "Discover Arita pottery", place: "Saga", category: "arts" },
    { title: "See Sakurajima", place: "Kagoshima", category: "nature" },
    { title: "Explore Huis Ten Bosch", place: "Sasebo · Nagasaki", category: "family" },
    { title: "Eat by the lanterns", place: "Nakasu · Fukuoka", category: "nightlife" },
  ],
  okinawa: [
    { title: "See Kabira Bay", place: "Ishigaki", category: "coast" },
    { title: "Discover Ryukyu heritage", place: "Naha", category: "culture" },
    { title: "Snorkel clear waters", place: "Kerama Islands", category: "outdoors" },
    { title: "Taste Okinawa soba", place: "Okinawa", category: "food" },
    { title: "Browse Kokusai-dōri", place: "Naha", category: "shopping" },
    { title: "See an Eisa dance", place: "Okinawa", category: "festivals" },
    { title: "Visit Churaumi Aquarium", place: "Motobu", category: "family" },
  ],
};
