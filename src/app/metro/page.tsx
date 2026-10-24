import type { Metadata } from "next";
import { Header, Footer } from "@/components/shared";
import { ExploreHero, ExploreMotion } from "@/components/explore-shared";
import { MetroMap } from "@/components/metro-map";
import { Kintsugi } from "@/components/kintsugi";
import tokyo from "@/data/metro/tokyo.json";
import osaka from "@/data/metro/osaka.json";
import kyoto from "@/data/metro/kyoto.json";
import sapporo from "@/data/metro/sapporo.json";
import sendai from "@/data/metro/sendai.json";
import yokohama from "@/data/metro/yokohama.json";
import nagoya from "@/data/metro/nagoya.json";
import kobe from "@/data/metro/kobe.json";
import fukuoka from "@/data/metro/fukuoka.json";
import naha from "@/data/metro/naha.json";
import kanto from "@/data/reviews/kanto.json";
import kansai from "@/data/reviews/kansai.json";
import shopping from "@/data/reviews/shopping.json";
import type { MetroData } from "@/lib/metro";
export const metadata: Metadata = {
  title: "Japan rail atlas — Japan, Your Way",
  description:
    "Explore rail corridors across Japan and connected English station maps for ten city networks, from Sapporo to Okinawa.",
};
const networks: Record<string, MetroData> = {
  Sapporo: sapporo,
  Sendai: sendai,
  Tokyo: tokyo,
  Yokohama: yokohama,
  Nagoya: nagoya,
  Kyoto: kyoto,
  Osaka: osaka,
  Kobe: kobe,
  Fukuoka: fukuoka,
  Naha: naha,
};
export default function Page() {
  const food = [...kanto, ...kansai];
  const nearby = [
    ...food.map((r) => ({
      id: r.id,
      name: r.name,
      tab: "food",
      stationIds:
        "nearestStationId" in r && r.nearestStationId
          ? [r.nearestStationId]
          : [],
    })),
    ...shopping.map((r) => ({
      id: r.id,
      name: r.name,
      tab: "shopping",
      stationIds: r.nearestStations,
    })),
  ];
  return (
    <div className="home-shell editorial explore-page metro-page">
      <Header />
      <main id="main">
        <ExploreHero metro />
        <MetroMap
          cities={Object.entries(networks).map(([city, d]) => ({
            city,
            lines: d.lines.filter((l) => l.code !== "m").length,
            stations: d.stations.length,
          }))}
          stationIndex={Object.values(networks).flatMap((n) =>
            n.stations.map(({ id, city, nameEn, codes }) => ({
              id,
              city,
              nameEn,
              codes,
            })),
          )}
          nearby={nearby.filter((p) => p.stationIds.length)}
        />
        <section className="explore-wrap riding-panel" data-enter>
          <Kintsugi variant={2} />
          <div>
            <h2>Ride with a little confidence.</h2>
            <p>
              Match the line letter, station number and direction on the
              platform signs. Check the operator for fares, accessible routes
              and the last train on your travel date.
            </p>
          </div>
          <div>
            <p>
              Suica, PASMO and ICOCA are among the IC cards accepted on Kyoto’s
              subway. Operator rules and availability can change.
            </p>
            <p>
              <a href="https://www2.city.kyoto.lg.jp/kotsu/webguide/en/tika/howtoride_tika.html">
                Kyoto riding guide ↗
              </a>{" "}
              ·{" "}
              <a href="https://www.tokyometro.jp/lang_en/ticket/types/pasmo/index.html">
                Tokyo Metro PASMO guide ↗
              </a>{" "}
              ·{" "}
              <a href="https://subway.osakametro.co.jp/en/guide/routemap.php">
                Osaka operator map ↗
              </a>
            </p>
            <p>
              <a href="https://global.jr-central.co.jp/en/info/route_map/">
                Tokaido Shinkansen operator route reference ↗
              </a>
              . The Japan overview includes major national and regional
              corridors. It omits intermediate stations and does not describe a
              timetable or a fare.
            </p>
            <p>Source references checked 24 October 2026.</p>
          </div>
        </section>
        <section id="station-lists" className="explore-wrap station-lists">
          <h2>Every station, in words.</h2>
          <p>
            Complete line lists work without JavaScript or the interactive map.
            Ten detailed city systems are included, with wider rail corridors
            across Japan above. Local operators and intermediate stations
            outside these systems remain linked through operator references.
          </p>
          {Object.entries(networks).map(([city, data]) => (
            <section key={city}>
              <h3>{city}</h3>
              {data.lines.map((line) => (
                <details key={line.id}>
                  <summary>
                    {line.code} · {line.nameEn} · {line.stationIds.length} stops
                  </summary>
                  <ol>
                    {line.stationIds.map((id) => {
                      const s = data.stations.find((s) => s.id === id)!;
                      return (
                        <li key={id}>
                          <a href={`/metro/?station=${s.id}`}>
                            {s.nameEn} · {s.codes.join(" / ")}
                          </a>
                          {s.lineIds.length > 1 && (
                            <span>
                              {" "}
                              · Interchange:{" "}
                              {s.lineIds
                                .filter((id) => id !== line.id)
                                .map(
                                  (id) =>
                                    data.lines.find((l) => l.id === id)?.nameEn,
                                )
                                .join(", ")}
                            </span>
                          )}
                          {s.interchangeIds?.length && (
                            <span>
                              {" "}
                              · Connected:{" "}
                              {s.interchangeIds
                                .map(
                                  (id) =>
                                    data.stations.find((s) => s.id === id)
                                      ?.nameEn,
                                )
                                .join(", ")}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                  {line.extraEdges?.length && (
                    <p>
                      Additional connections:{" "}
                      {line.extraEdges
                        .map(
                          ([a, b]) =>
                            `${data.stations.find((s) => s.id === a)?.nameEn} ↔ ${data.stations.find((s) => s.id === b)?.nameEn}`,
                        )
                        .join("; ")}
                      .
                    </p>
                  )}
                  <p>
                    {line.operator} · checked {line.checkedOn}.{" "}
                    <a href={line.sources[0].url}>Operator reference ↗</a>
                  </p>
                </details>
              ))}
            </section>
          ))}
        </section>
      </main>
      <Footer />
      <ExploreMotion />
    </div>
  );
}
