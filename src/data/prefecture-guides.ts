type PrefectureGuide = {
  summary: string;
  places: [string, string];
};

// Short introductions and starting points drawn from JNTO's prefecture guides.
export const prefectureGuides: Record<string, PrefectureGuide> = {
  Hokkaido: {
    summary: "Japan's northern island pairs Sapporo's city life with big landscapes, winter sports and summer flower fields.",
    places: ["Niseko's ski slopes", "Furano's flower fields"],
  },
  Aomori: {
    summary: "This northern prefecture is known for lively summer festivals, apple country and castle-town blossoms.",
    places: ["Aomori Nebuta Festival", "Hirosaki Castle Park"],
  },
  Akita: {
    summary: "Forest-covered mountains, hot springs and rural traditions make Akita a slower northern escape.",
    places: ["Mount Hachimantai", "Goshogake Onsen"],
  },
  Iwate: {
    summary: "Explore heritage sites at Hiraizumi, then travel toward the dramatic Sanriku coast.",
    places: ["Chūson-ji in Hiraizumi", "Sanriku coast"],
  },
  Yamagata: {
    summary: "Mountain temples and hot-spring towns sit close to the winter scenery of the Zaō range.",
    places: ["Yamadera temple", "Zaō Onsen"],
  },
  Miyagi: {
    summary: "Sendai opens the way to pine-covered islands, coastal views and mountain scenery.",
    places: ["Matsushima Bay", "Sendai"],
  },
  Fukushima: {
    summary: "Fukushima brings together samurai-era towns, mineral lakes and outdoor routes in the mountains.",
    places: ["Goshikinuma lakes", "Aizuwakamatsu"],
  },
  Niigata: {
    summary: "Deep-snow country meets rice, sake and the Sea of Japan, with mountain and island trips to choose from.",
    places: ["Echigo-Yuzawa", "Sado Island"],
  },
  Toyama: {
    summary: "From alpine routes to traditional mountain villages, Toyama connects the Japan Alps with the coast.",
    places: ["Tateyama Kurobe Alpine Route", "Gokayama villages"],
  },
  Ishikawa: {
    summary: "Kanazawa's preserved districts, gardens and crafts give Ishikawa a strong cultural character.",
    places: ["Kenrokuen Garden", "Kanazawa's craft districts"],
  },
  Fukui: {
    summary: "Fukui is a place for Zen temple visits, coastal scenery and distinctive local food.",
    places: ["Eiheiji temple", "Echizen coast"],
  },
  Nagano: {
    summary: "Highland walking, winter sports and old post towns make Nagano a year-round mountain destination.",
    places: ["Kamikōchi", "Tsumago and Narai"],
  },
  Tokyo: {
    summary: "Modern neighborhoods, historic temple streets, food and museums sit side by side across the capital.",
    places: ["Asakusa and Sensō-ji", "Shibuya and Harajuku"],
  },
  Kanagawa: {
    summary: "Yokohama's waterfront, Kamakura's temples and Hakone's hot springs offer very different day trips.",
    places: ["Kamakura's Great Buddha", "Yokohama waterfront"],
  },
  Chiba: {
    summary: "Chiba stretches from Tokyo Bay's theme parks to beaches and coastal towns on the Bōsō Peninsula.",
    places: ["Tokyo Disney Resort", "Bōsō Peninsula"],
  },
  Saitama: {
    summary: "Just beyond Tokyo, Saitama offers Edo-period streets and river scenery in the Chichibu hills.",
    places: ["Kawagoe", "Nagatoro"],
  },
  Ibaraki: {
    summary: "Seasonal flower fields, gardens and Pacific coast sights make Ibaraki a colorful outdoor stop.",
    places: ["Hitachi Seaside Park", "Ōarai Isosaki Shrine"],
  },
  Tochigi: {
    summary: "Tochigi combines Nikkō's ornate shrines with mountain walks and Utsunomiya's food scene.",
    places: ["Nikkō shrines", "Utsunomiya gyōza"],
  },
  Gunma: {
    summary: "Gunma's mountain towns are known for hot-spring bathing and outdoor adventures on rivers and trails.",
    places: ["Kusatsu Onsen", "Minakami"],
  },
  Yamanashi: {
    summary: "Mount Fuji dominates Yamanashi's lake country, with hiking, views and vineyards beyond the shore.",
    places: ["Fuji Five Lakes", "Yoshida Trail"],
  },
  Shizuoka: {
    summary: "Tea landscapes, the Izu coast and views of Mount Fuji give Shizuoka a mix of sea and mountain trips.",
    places: ["Nihondaira tea country", "Izu Peninsula"],
  },
  Gifu: {
    summary: "Preserved mountain towns and traditional wooden villages sit among Gifu's alpine scenery.",
    places: ["Takayama old town", "Shirakawa-gō"],
  },
  Aichi: {
    summary: "Aichi blends Nagoya's city life and regional food with castles and long-running craft traditions.",
    places: ["Nagoya", "Inuyama Castle"],
  },
  Mie: {
    summary: "Sacred shrine forests, the Ise coast and Iga's ninja heritage shape a varied visit to Mie.",
    places: ["Ise Jingū", "Iga Ueno"],
  },
  Kyoto: {
    summary: "Kyoto's temple paths, gardens and traditional streets reach far beyond the busiest central sights.",
    places: ["Higashiyama", "Ōhara"],
  },
  Osaka: {
    summary: "Osaka is a lively city for street food, nightlife, castle grounds and family attractions.",
    places: ["Dōtonbori", "Osaka Castle Park"],
  },
  Shiga: {
    summary: "Lake Biwa sets the pace for Shiga, with waterfront scenery and historic towns around its shores.",
    places: ["Lake Biwa", "Hikone Castle"],
  },
  Hyogo: {
    summary: "Hyōgo spans Himeji's castle, Kobe's port-city streets and hot-spring towns near the sea.",
    places: ["Himeji Castle", "Kobe waterfront"],
  },
  Nara: {
    summary: "Ancient temples, sacred routes and parkland deer reflect Nara's place in Japan's early history.",
    places: ["Nara Park", "Hōryū-ji"],
  },
  Wakayama: {
    summary: "Pilgrimage trails and mountain temples lead into Wakayama's deeply spiritual landscape.",
    places: ["Kōyasan", "Kumano Kodō"],
  },
  Tottori: {
    summary: "Sand dunes, open coastline, mountain hikes and hot springs define this quieter western prefecture.",
    places: ["Tottori Sand Dunes", "Mount Daisen"],
  },
  Shimane: {
    summary: "Shrines, historic mining sites and serene islands reward a slower journey along the Sea of Japan.",
    places: ["Izumo Taisha", "Iwami Ginzan"],
  },
  Okayama: {
    summary: "Elegant gardens and canal-side merchant streets make Okayama an easy cultural stop.",
    places: ["Kōrakuen Garden", "Kurashiki Bikan Quarter"],
  },
  Hiroshima: {
    summary: "Reflect at Hiroshima's Peace Memorial Park, then travel to the islands of the Seto Inland Sea.",
    places: ["Peace Memorial Park", "Miyajima"],
  },
  Yamaguchi: {
    summary: "Castle-town lanes, coastal scenery and pottery traditions shape Yamaguchi's quieter western edge.",
    places: ["Hagi old town", "Hagi-yaki pottery"],
  },
  Kagawa: {
    summary: "Small in size, Kagawa is rich in garden landscapes, island art and its celebrated udon noodles.",
    places: ["Naoshima", "Ritsurin Garden"],
  },
  Tokushima: {
    summary: "Dance festival energy meets river gorges, vine bridges and whirlpools in Tokushima.",
    places: ["Awa Odori", "Iya Valley"],
  },
  Ehime: {
    summary: "Cycle above the Seto Inland Sea or slow down in Matsuyama's classic hot-spring district.",
    places: ["Shimanami Kaidō", "Dōgo Onsen"],
  },
  Kochi: {
    summary: "Pacific beaches, river camping and rural scenery give Kōchi a distinctly outdoor feel.",
    places: ["Shimanto River", "Pacific coast"],
  },
  Fukuoka: {
    summary: "Kyushu's gateway city is a starting point for food stalls, shrine visits and easy coastal trips.",
    places: ["Dazaifu Tenmangū", "Fukuoka yatai"],
  },
  Saga: {
    summary: "Pottery towns, gardens and hot springs invite a slower trip through northern Kyushu.",
    places: ["Arita pottery", "Mifuneyama Rakuen"],
  },
  Nagasaki: {
    summary: "Port-city history, European influences and island beaches tell Nagasaki's layered story.",
    places: ["Dejima and Glover Garden", "Gotō Islands"],
  },
  Kumamoto: {
    summary: "Volcanic scenery and castle history sit alongside traditional hot-spring villages.",
    places: ["Mount Aso", "Kumamoto Castle"],
  },
  Oita: {
    summary: "Ōita is one of Japan's best-known hot-spring areas, with steaming towns and quiet countryside.",
    places: ["Beppu", "Yufuin"],
  },
  Miyazaki: {
    summary: "Sunny coastline, sea-facing shrines and mountain valleys make Miyazaki an outdoor destination.",
    places: ["Aoshima", "Takachiho Gorge"],
  },
  Kagoshima: {
    summary: "Volcano views meet the ancient forests of Yakushima on Kyushu's southern edge.",
    places: ["Sakurajima", "Yakushima"],
  },
  Okinawa: {
    summary: "Okinawa's islands bring together Ryukyu heritage, coral seas and subtropical landscapes.",
    places: ["Naha and Shuri", "Ishigaki and Kabira Bay"],
  },
};

export function prefectureGuideUrl(regionId: string, prefecture: string) {
  return `https://www.japan.travel/en/destinations/${regionId}/${prefecture.toLowerCase().replaceAll(" ", "-")}/`;
}
