export type Place = {
  name: string;
  kind: string;
  regionId: string;
  prefecture: string;
  highlight: string;
  lat: number;
  lon: number;
  image: string;
  imageAlt: string;
  featured?: boolean;
  fullDescription: string;
  experiences: string[];
  gettingThere: string;
  bestSeason: string;
  officialUrl: string;
  metroCity?: string;
};

export const places: Place[] = [
  {
    name: "Sapporo",
    kind: "City · Hokkaido",
    regionId: "hokkaido",
    prefecture: "Hokkaido",
    highlight: "Wide parks, winter festivals and Hokkaido food.",
    lat: 43.0618,
    lon: 141.3545,
    image: "/images/regions/hokkaido.jpg",
    imageAlt: "Odori Park in Sapporo with mountains beyond",
    fullDescription:
      "Hokkaido’s capital combines wide grid-planned boulevards and expansive green spaces with world-renowned culinary culture. Founded in the late 19th century, Sapporo is world-famous for its annual Snow Festival in Odori Park, where towering snow and ice sculptures draw visitors from across the globe. In warmer months, the city is a breezy northern gateway to lavender fields, volcanic calderas, and mountain hiking trails. Food lovers flock to Susukino for steaming bowls of authentic miso ramen, fresh seafood from Nijo Market, and local Genghis Khan grilled lamb.",
    experiences: [
      "Stroll through Odori Park, the green heart of the city",
      "Sample authentic miso ramen in Ganso Ramen Yokocho alley",
      "Tour the historic Sapporo Beer Museum and tasting hall",
      "Explore the covered Tanukikoji shopping arcade",
    ],
    gettingThere:
      "Fly into New Chitose Airport (CTS), then take the JR Rapid Airport train (37 minutes) to Sapporo Station. Connected via the Sapporo Subway network.",
    bestSeason:
      "Winter (Dec–Feb) for world-class skiing and the Sapporo Snow Festival; Summer (Jul–Aug) for cool weather and flower blooms.",
    officialUrl:
      "https://www.japan.travel/en/destinations/hokkaido/hokkaido/sapporo-and-around/",
    metroCity: "Sapporo",
  },
  {
    name: "Matsushima Bay",
    kind: "Coast · Tohoku",
    regionId: "tohoku",
    prefecture: "Miyagi",
    highlight: "Pine-clad islands and calm views from Miyagi’s coast.",
    lat: 38.371,
    lon: 141.069,
    image: "/images/regions/tohoku.jpg",
    imageAlt: "Matsushima Bay in Miyagi with pine islands",
    fullDescription:
      "Counted for centuries as one of Japan’s Three Scenic Views (Nihon Sankei), Matsushima Bay is dotted with over 260 pine-covered islets rising from calm turquoise waters. The historic port town of Matsushima is anchored by Zuigan-ji, a magnificent Zen temple rebuilt in 1609 by feudal lord Date Masamune with gilded sliding doors and moss-carpeted cedar paths. Sightseeing cruises weave between the islets, while red wooden footbridges connect the mainland to sacred Godaido Hall and Fukuura Island botanical park.",
    experiences: [
      "Take a panoramic bay cruise among the pine islets",
      "Walk the 252-meter red bridge to Fukuura Island botanical park",
      "Explore the National Treasure halls and rock carvings at Zuigan-ji",
      "Taste freshly grilled Matsushima oysters and local sasa-kamaboko fish cakes",
    ],
    gettingThere:
      "JR Senseki Line from Sendai Station to Matsushimakaigan Station (40 minutes). Sendai is 90 minutes from Tokyo via the Tohoku Shinkansen.",
    bestSeason:
      "Autumn (Oct–Nov) for brilliant foliage framing the bay; Summer for breezy coastal walks.",
    officialUrl: "https://www.japan.travel/en/spot/1838/",
  },
  {
    name: "Tokyo",
    kind: "Capital · Kanto",
    regionId: "kanto",
    prefecture: "Tokyo",
    highlight: "Asakusa lanes, modern neighborhoods and late-night light.",
    lat: 35.6762,
    lon: 139.6503,
    image: "/images/tokyo.webp",
    imageAlt: "Nakamise shopping street in Tokyo",
    featured: true,
    fullDescription:
      "Japan’s bustling capital is a dynamic metropolis where centuries-old traditions stand shoulder-to-shoulder with cutting-edge architecture and vibrant urban culture. From the ancient incense-perfumed courtyards of Sensō-ji in Asakusa to the neon canyons of Shinjuku and Shibuya’s famous scramble crossing, Tokyo offers endless contrasts. Quiet residential shotengai shopping lanes, peaceful Meiji Shrine forests, and world-class culinary havens ranging from Michelin-starred counters to cozy standing yakitori bars make every neighborhood a distinct world to discover.",
    experiences: [
      "Pass through Kaminarimon Gate to explore historic Sensō-ji in Asakusa",
      "Watch the rhythm of the city at Shibuya Scramble Crossing and Miyashita Park",
      "Walk beneath towering evergreen trees to tranquil Meiji Jingu shrine",
      "Discover evening dining alleys in Omoide Yokocho and Yanaka Ginza",
    ],
    gettingThere:
      "Served by Haneda (HND) and Narita (NRT) international airports, Tokyo Station bullet trains, and the world’s most extensive subway and commuter rail network.",
    bestSeason:
      "Spring (late Mar–early Apr) for cherry blossoms; Autumn (Nov–early Dec) for ginkgo and maple foliage.",
    officialUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    metroCity: "Tokyo",
  },
  {
    name: "Mount Fuji",
    kind: "Mountain · Tokai",
    regionId: "tokai",
    prefecture: "Yamanashi & Shizuoka",
    highlight: "Japan’s iconic peak above lakes and mountain towns.",
    lat: 35.3606,
    lon: 138.7274,
    image: "/images/fuji-night-1920.webp",
    imageAlt: "Mount Fuji and Chureito Pagoda",
    featured: true,
    fullDescription:
      "Rising symmetrically to 3,776 meters, Mount Fuji (Fuji-san) is Japan’s highest peak and an enduring spiritual icon recognized as a UNESCO World Heritage cultural site. Surrounding the volcanic giant are the scenic Fuji Five Lakes (Fujigoko), with Lake Kawaguchiko offering postcard-perfect mirrored reflections of the snow-capped volcano. At Arakurayama Sengen Park, the scarlet five-storied Chureito Pagoda frames Fuji against spring cherry blossoms or fiery autumn leaves, creating one of Japan’s most celebrated vistas.",
    experiences: [
      "Climb the 398 steps to Chureito Pagoda for the iconic Fuji view",
      "Cruise or cycle around Lake Kawaguchiko with views of the mountain",
      "Explore the thatched roofs and crystal-clear spring ponds of Oshino Hakkai",
      "Hike the Yoshida Trail to the summit during the official summer climbing season",
    ],
    gettingThere:
      "Fuji Excursion direct express train from Shinjuku Station to Kawaguchiko (under 2 hours), or direct highway express buses from Tokyo and Shinjuku.",
    bestSeason:
      "November to February for the clearest snow-capped views; July to early September for summit hiking.",
    officialUrl: "https://www.japan.travel/en/fuji-guide/",
  },
  {
    name: "Kanazawa",
    kind: "City · Hokuriku",
    regionId: "hokuriku-shinetsu",
    prefecture: "Ishikawa",
    highlight: "Kenrokuen garden, craft traditions and old streets.",
    lat: 36.5613,
    lon: 136.6562,
    image: "/images/regions/hokuriku-shinetsu.jpg",
    imageAlt: "Kenrokuen garden in Kanazawa",
    fullDescription:
      "Often called the jewel of the Sea of Japan coast, Kanazawa was spared the destruction of World War II, preserving an astonishing concentration of Edo-era heritage. Kenroku-en, hailed as one of Japan’s three supreme landscape gardens, features cascading ponds, curved stone bridges, and iconic yukizuri conical rope supports protecting ancient pine branches in winter. Across the castle moat, the geisha teahouses of Higashi Chaya and the earthen-walled lanes of the Nagamachi samurai district celebrate Kanazawa’s rich gold-leaf, Kutani porcelain, and lacquerware craftsmanship.",
    experiences: [
      "Meander through Kenroku-en garden and cross to Kanazawa Castle Park",
      "Wander the cobblestone lanes and preserved teahouses of Higashi Chaya",
      "Feast on fresh Sea of Japan crab, sweet shrimp, and sushi at Omicho Market",
      "Experience cutting-edge installations at the 21st Century Museum of Contemporary Art",
    ],
    gettingThere:
      "Hokuriku Shinkansen bullet train from Tokyo Station to Kanazawa Station in just 2.5 hours.",
    bestSeason:
      "Winter (Dec–Feb) for snow-draped gardens and fresh snow crab; Spring for cherry blossoms in Kenroku-en.",
    officialUrl:
      "https://www.japan.travel/en/destinations/hokuriku-shinetsu/ishikawa/kanazawa-and-around/",
  },
  {
    name: "Kyoto",
    kind: "City · Kansai",
    regionId: "kansai",
    prefecture: "Kyoto",
    highlight: "Temple paths, Higashiyama lanes and centuries of craft.",
    lat: 35.0116,
    lon: 135.7681,
    image: "/images/kyoto.webp",
    imageAlt: "Higashiyama street in Kyoto",
    featured: true,
    fullDescription:
      "The imperial capital of Japan for over a thousand years, Kyoto is the cultural soul of the nation, boasting 17 UNESCO World Heritage sites and more than 2,000 temples and shrines. Stone-paved alleys in Gion and Higashiyama wind past wooden machiya merchant homes, where geiko and maiko hurry to evening appointments. From the thousands of vermilion torii gates winding up sacred Mount Inari to the golden pavilion of Kinkaku-ji and the quiet bamboo groves of Arashiyama, Kyoto rewards mindful, unhurried exploration.",
    experiences: [
      "Walk the ethereal vermilion path through 10,000 torii at Fushimi Inari-taisha",
      "Explore the wooden temple terraces of Kiyomizu-dera overlooking the city",
      "Experience an authentic Uji matcha tea ceremony in a historic machiya",
      "Wander the lantern-lit Gion Shirakawa canal and Pontocho dining alley at dusk",
    ],
    gettingThere:
      "Tokaido Shinkansen bullet train from Tokyo (2 hours 15 minutes) or 30 minutes from Osaka. Connected by Kyoto City Subway and Hankyu/Keihan lines.",
    bestSeason:
      "Autumn (mid-Nov to early Dec) for breathtaking maple illumination; Spring (early Apr) for cherry blossoms.",
    officialUrl: "https://www.japan.travel/en/destinations/kansai/kyoto/",
    metroCity: "Kyoto",
  },
  {
    name: "Osaka",
    kind: "City · Kansai",
    regionId: "kansai",
    prefecture: "Osaka",
    highlight: "Canal-side neon, street food and lively evenings.",
    lat: 34.6937,
    lon: 135.5023,
    image: "/images/osaka.webp",
    imageAlt: "Dotonbori district in Osaka",
    fullDescription:
      "Known as the 'Nation’s Kitchen' (Tenka no Daidokoro), Osaka is celebrated for its warm, extroverted locals, vibrant nightscape, and unbeatable culinary culture centered around the philosophy of kuidaore ('eat until you drop'). The bustling Dōtonbori promenade dazzles with colossal mechanical crab signs and the glowing Glico running man reflected in the canal. Beyond street snacks, Osaka features the majestic multi-tiered Osaka Castle surrounded by park moats, the nostalgic retro-showa vibe of Shinsekai, and panoramic views from the Umeda Sky Building.",
    experiences: [
      "Bite into piping-hot octopus takoyaki and crispy kushikatsu along Dōtonbori",
      "Climb to the observation deck of Osaka Castle and walk the surrounding citadel walls",
      "Gaze across the Kansai plain from the open-air Floating Garden Observatory at Umeda Sky Building",
      "Explore the retro atmosphere and Tsutenkaku Tower in nostalgic Shinsekai",
    ],
    gettingThere:
      "Shinkansen bullet train to Shin-Osaka Station; Kansai International Airport (KIX) express train (35–45 minutes). Connected by the extensive Osaka Metro network.",
    bestSeason:
      "Spring (Apr) for park blossoms around the castle; Autumn (Oct–Nov) for crisp evening food walks.",
    officialUrl: "https://www.japan.travel/en/destinations/kansai/osaka/",
    metroCity: "Osaka",
  },
  {
    name: "Miyajima",
    kind: "Island · Chugoku",
    regionId: "chugoku",
    prefecture: "Hiroshima",
    highlight: "Itsukushima Shrine’s sea-facing torii and forest trails.",
    lat: 34.296,
    lon: 132.3193,
    image: "/images/regions/chugoku.jpg",
    imageAlt: "Itsukushima torii on Miyajima",
    featured: true,
    fullDescription:
      "Officially named Itsukushima, this sacred island in the Seto Inland Sea has been revered for over a millennium. Its hallmark is the floating vermilion torii gate of Itsukushima Shrine, engineered on stilts over the tidal flat so that at high tide the entire shrine complex appears to drift on the sea. Wild, gentle Sika deer roam freely along the forested shores and town streets. A cable car or scenic hiking trails climb to the granite peak of Mount Misen, where Buddhist priest Kobo Daishi founded a sanctuary with sweeping views of the archipelago.",
    experiences: [
      "Witness Itsukushima Shrine floating at high tide, then walk out to the torii at low tide",
      "Ascend Mount Misen via ropeway or forest trail for panoramic Seto Inland Sea views",
      "Savor warm maple-leaf-shaped momiji manju cakes filled with red bean, matcha, or custard",
      "Taste sweet Seto Inland Sea grilled oysters at lively seaside stalls",
    ],
    gettingThere:
      "JR Sanyo Line from Hiroshima Station to Miyajimaguchi (28 minutes), followed by a 10-minute scenic JR ferry ride.",
    bestSeason:
      "Autumn (Nov) when Japanese maples blaze crimson in Momijidani Park; Spring for coastal cherry blossoms.",
    officialUrl: "https://www.japan.travel/en/spot/927/",
  },
  {
    name: "Ritsurin Garden",
    kind: "Garden · Shikoku",
    regionId: "shikoku",
    prefecture: "Kagawa",
    highlight: "A historic landscape garden of ponds and borrowed scenery.",
    lat: 34.3297,
    lon: 134.0433,
    image: "/images/regions/shikoku.jpg",
    imageAlt: "Ritsurin Garden in Takamatsu",
    fullDescription:
      "Spanning nearly 75 hectares in Takamatsu, Ritsurin Garden is widely regarded as one of the finest feudal daimyo stroll gardens in Japan. Constructed over more than a century by the ruling Matsudaira lords, the garden seamlessly integrates six tranquil ponds, thirteen landscaped hills, and over 1,400 artistically sculpted black pine trees against the dramatic backdrop of Mount Shiun. Visitors can cross the crescent-shaped Engetsu-kyo bridge, glide across the South Pond in traditional wooden wasen boats, and sip matcha at the historic Kikugetsu-tei teahouse.",
    experiences: [
      "Sip ceremonial matcha inside Kikugetsu-tei pavilion overlooking the reflective lake",
      "Take a piloted wooden wasen boat cruise across South Pond",
      "Admire the centuries-old Neagari no Matsu exposed-root black pine",
      "Enjoy fresh Sanuki udon in Takamatsu, the celebrated udon capital of Japan",
    ],
    gettingThere:
      "JR Kotoku Line from Takamatsu Station to Ritsuringoen-Kitaguchi Station (5 minutes), or a 10-minute walk from Kotoden Ritsurin-Koen Station.",
    bestSeason:
      "Year-round; early spring brings plum and cherry blossoms, autumn highlights vibrant maples reflected in the ponds.",
    officialUrl: "https://www.japan.travel/en/spot/811/",
  },
  {
    name: "Mount Aso",
    kind: "Volcano · Kyushu",
    regionId: "kyushu",
    prefecture: "Kumamoto",
    highlight: "Volcanic grasslands and a vast central caldera.",
    lat: 32.8844,
    lon: 131.1044,
    image: "/images/regions/kyushu.jpg",
    imageAlt: "Landscape around Mount Aso",
    fullDescription:
      "Dominating central Kyushu, Mount Aso features one of the largest volcanic calderas on Earth, measuring 25 kilometers north-to-south and 18 kilometers east-to-west. Within this immense ancient rim sit active volcanic peaks, including the steaming Nakadake crater with its eerie turquoise acid lake. Surrounding the peaks are the sweeping green meadows of Kusasenri-ga-hama, where semi-wild horses graze beside volcanic ponds. The geothermal activity feeds famous nearby hot spring towns like Kurokawa Onsen, renowned for open-air riverside rotenburo baths.",
    experiences: [
      "Look into the steaming sulfur vents of active Nakadake Crater when open",
      "Hike or ride horses across the vast green plateau of Kusasenri",
      "Visit the Aso Volcano Museum to understand the geological forces that shaped Japan",
      "Unwind in the traditional cedar-lined outdoor baths of nearby Kurokawa Onsen",
    ],
    gettingThere:
      "JR Hohi Main Line to Aso Station, followed by the Sanko bus up to the Aso crater ropeway station.",
    bestSeason:
      "Spring and Summer for lush emerald grasslands; Autumn for golden pampas grass and clear mountain skies.",
    officialUrl:
      "https://www.japan.travel/en/destinations/kyushu/kumamoto/mount-aso-and-around/",
  },
  {
    name: "Ishigaki",
    kind: "Island · Okinawa",
    regionId: "okinawa",
    prefecture: "Okinawa",
    highlight: "Clear water and the sheltered colors of Kabira Bay.",
    lat: 24.3448,
    lon: 124.1572,
    image: "/images/regions/okinawa.jpg",
    imageAlt: "Kabira Bay on Ishigaki",
    featured: true,
    fullDescription:
      "Located 400 kilometers southwest of Okinawa’s main island, Ishigaki is the cultural and transit heart of the sub-tropical Yaeyama archipelago. The island is world-famous for Kabira Bay, where crystalline emerald waters, white coral sands, and forested karst islets create a protected marine reserve where black pearls are cultured. Because swimming is forbidden in the bay to preserve delicate coral, glass-bottom boats offer close-up views of clownfish, sea turtles, and coral gardens. Offshore, Manta Scramble is celebrated globally as one of the premier dive spots for observing giant manta rays.",
    experiences: [
      "Board a glass-bottom boat in Kabira Bay to view vibrant corals and marine life",
      "Snorkel or scuba dive with giant manta rays at Manta Scramble",
      "Kayak through lush mangrove forests along the Miyara and Fukido rivers",
      "Savor tender marbled Ishigaki Wagyu beef and Yaeyama soba noodles",
    ],
    gettingThere:
      "Direct flights from Tokyo (Haneda), Osaka, and Naha to New Ishigaki Airport (ISG). Express ferries connect Ishigaki port to Taketomi, Iriomote, and Kohama islands.",
    bestSeason:
      "April to October for diving, snorkeling and warm tropical beach weather; Winter for mild temperatures and star-gazing.",
    officialUrl:
      "https://www.japan.travel/en/destinations/okinawa/okinawa/ishigaki-and-the-yaeyama-islands/",
  },
];
