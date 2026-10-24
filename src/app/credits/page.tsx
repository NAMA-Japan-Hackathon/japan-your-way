import { Header, Footer } from "@/components/shared";
import { PlacePhoto } from "@/components/explore-shared";
import credits from "../../../public/images/credits.json";
import kanto from "@/data/reviews/kanto.json";
import kansai from "@/data/reviews/kansai.json";
import shopping from "@/data/reviews/shopping.json";
import tokyo from "@/data/metro/tokyo.json";
import osaka from "@/data/metro/osaka.json";
import kyoto from "@/data/metro/kyoto.json";
import { allergenConfig } from "@/data/allergens";
import sapporo from "@/data/metro/sapporo.json";
import sendai from "@/data/metro/sendai.json";
import yokohama from "@/data/metro/yokohama.json";
import nagoya from "@/data/metro/nagoya.json";
import kobe from "@/data/metro/kobe.json";
import fukuoka from "@/data/metro/fukuoka.json";
import naha from "@/data/metro/naha.json";
import national from "@/data/metro/national.json";
import regions from "@/data/regions.json";
const networks = [
  tokyo,
  osaka,
  kyoto,
  sapporo,
  sendai,
  yokohama,
  nagoya,
  kobe,
  fukuoka,
  naha,
];
const records = [
  ...kanto,
  ...kansai,
  ...shopping,
  ...networks.flatMap((n) => n.lines),
  ...national.routes,
  ...regions,
];
const sources = Array.from(
  new Map(records.flatMap((r) => r.sources).map((s) => [s.url, s])).values(),
);
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="page credits-page">
        <div className="page-intro">
          <h1>Places & provenance.</h1>
          <p>
            Photography and factual sources behind Japan, Your Way. Original
            summaries and schematic artwork are created for this site.
          </p>
        </div>
        <section className="notice">
          <h2>Image permissions</h2>
          <p>
            Six existing photographs have verified open licenses. Seven
            additional images are recorded as “unverified - personal use” and
            stored locally in the ignored personal-use folder. They are not
            included in the public repository. A clone shows typographic
            placeholders wherever those files are absent.
          </p>
          <p>
            Responsive images are converted to WebP at 640, 1280 and 1920 pixels
            without enlargement; a smaller original stays at its native size.
            The Fuji hero additionally has a native 3840-pixel variant. CSS
            crops images to the layout.
          </p>
        </section>
        <div className="credits-list">
          {credits.map((c) => (
            <article className="credit" key={c.ref}>
              <PlacePhoto
                name={c.title}
                image={{ src: c.src, alt: c.title, credit: c.ref }}
              />
              <h2>{c.title}</h2>
              <p>
                {c.creator
                  ? `By ${c.creator}`
                  : "Photographer not identified in the checked reference."}
              </p>
              <p>
                {c.license} ·{" "}
                <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                  Original source ↗
                </a>
                {"licenseUrl" in c && c.licenseUrl && (
                  <>
                    {" "}
                    · <a href={c.licenseUrl}>License terms</a>
                  </>
                )}
              </p>
              {c.license.startsWith("CC") && (
                <p>
                  Resized and converted to WebP, with a layout crop. Share-alike
                  adaptations remain under the source license.{" "}
                  <a href={c.src} download>
                    Download adapted photograph
                  </a>
                </p>
              )}
            </article>
          ))}
        </div>
        <section className="source-list">
          <h2>Food, shopping & transit data</h2>
          <p>
            References checked 24 October 2026. This catalogue contains 153 real
            restaurant records and 32 shopping records. It does not contain
            customer reviews or invented numeric ratings. Restaurant recognition
            uses the cited 2026 factual lists; first-party menu policies are
            recorded separately. JNTO’s vegetarian guide is historical (March
            2017), used only as a visiting signal, never as current ingredient
            or hours evidence.
          </p>
          <p>
            The rail atlas includes 65 selected national hubs, 28 corridors and
            639 stations in ten city systems: Sapporo, Sendai, Tokyo, Yokohama,
            Nagoya, Kyoto, Osaka, Kobe, Fukuoka and Naha. It omits many local
            operators and intermediate stops. Names, codes and connections come
            from cited operator references and factual station lists. Shared
            interchange nodes and octilinear paths form original schematic
            artwork; no operator map was traced.
          </p>
          <p>
            City layout was informed by individual factual station coordinates
            in the open-data-jp-railway-stations reference, then spaced and
            routed into original grid geometry. That repository supplies no
            explicit database license; its data file is not redistributed.
            Missing positions were interpolated. Positions are approximate and
            unsuitable for geographical navigation. The country outline is
            Natural Earth public-domain cartography.
          </p>
          <ul>
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.title} ↗
                </a>
              </li>
            ))}
            <li>
              <a href="https://en.wikipedia.org/wiki/List_of_Tokyo_Metro_stations">
                Tokyo Japanese station names · Wikipedia
              </a>
            </li>
            <li>
              <a href="https://en.wikipedia.org/wiki/List_of_Osaka_Metro_stations">
                Osaka Japanese station names · Wikipedia
              </a>
            </li>
            <li>
              <a href="https://www2.city.kyoto.lg.jp/kotsu/webguide/ja/fare/fare_tika.html">
                Kyoto Japanese station names · operator
              </a>
            </li>
            <li>
              <a href={allergenConfig.sourceUrl}>
                {allergenConfig.version} · mandatory and recommended allergens
              </a>
            </li>
            <li>
              <a href="https://global.jr-central.co.jp/en/info/route_map/">
                JR Central · Tokaido corridor
              </a>
            </li>
            <li>
              <a href="https://github.com/piuccio/open-data-jp-railway-stations">
                Station coordinate reference · no explicit repository license
              </a>
            </li>
            <li>
              <a href="https://www.naturalearthdata.com/about/terms-of-use/">
                Natural Earth · public-domain country outline
              </a>
            </li>
          </ul>
          <p>
            The CAA configuration applies to packaged processed-food labeling.
            It is not a restaurant safety certification. Unknown recipe or
            cross-contact evidence is always “Needs check.”
          </p>
        </section>
        <p className="notice">
          Self-hosted Cormorant Garamond and Hanken Grotesk are distributed
          under the SIL Open Font License.{" "}
          <a href="/fonts/Cormorant-OFL.txt">Cormorant license</a> ·{" "}
          <a href="/fonts/OFL.txt">Hanken license</a>. The current reading and
          control type uses the device’s system font.
        </p>
      </main>
      <Footer />
    </>
  );
}
