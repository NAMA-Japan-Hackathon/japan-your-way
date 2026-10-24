import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/shared";
import { ExploreMotion } from "@/components/explore-shared";
import { Kintsugi } from "@/components/kintsugi";
import { PrefectureExplorer } from "@/components/prefecture-explorer";
import regions from "@/data/regions.json";
import { regionPortraits } from "@/data/region-portraits";
export const metadata: Metadata = {
  title: "Explore all Japan — Japan, Your Way",
  description:
    "Discover all 47 prefectures, from Hokkaido to Okinawa, with regional guides and Japan’s rail atlas.",
};
const destinations = [
  {
    id: "asakusa",
    name: "Sensō-ji & Asakusa",
    place: "Tokyo · Kanto",
    image: "/images/tokyo.webp",
    alt: "Nakamise street and Sensō-ji in Asakusa, seen from above",
    summary:
      "Pass beneath the Kaminarimon lantern for Sensō-ji, then wander Nakamise-dori’s shops and snack stalls. The temple grounds bring together old Tokyo architecture, gardens and a five-storied pagoda.",
    detailLabel: "Getting there",
    detail: "About a five-minute walk from Asakusa Station.",
    regionId: "kanto",
    source: "https://www.japan.travel/en/spot/1691/",
  },
  {
    id: "gion",
    name: "Gion & Higashiyama",
    place: "Kyoto · Kansai",
    image: "/images/kyoto.webp",
    alt: "Yasaka Pagoda rises above the traditional lanes of Higashiyama, Kyoto",
    summary:
      "Walk the lanes lined with traditional machiya townhouses, then continue toward Yasaka Shrine and Maruyama Park. In the evening, the lantern-lit streets feel very different from the daytime walk.",
    detailLabel: "Getting there",
    detail: "Gion-Shijō and Kyoto-Kawaramachi stations are a short walk away.",
    regionId: "kansai",
    source: "https://www.japan.travel/en/spot/84/",
  },
  {
    id: "dotonbori",
    name: "Dōtonbori",
    place: "Osaka · Kansai",
    image: "/images/osaka.webp",
    alt: "Neon signs and reflections along the Dōtonbori canal in Osaka",
    summary:
      "Follow the canal-side promenade beneath the bright signs, including the famous Glico runner. This lively district is known for Osaka favorites such as takoyaki and okonomiyaki.",
    detailLabel: "Getting there",
    detail: "Namba Station is a convenient starting point for the canal and bridge.",
    regionId: "kansai",
    source: "https://www.japan.travel/en/spot/2207/",
  },
  {
    id: "arakurayama",
    name: "Arakurayama Sengen Park",
    place: "Yamanashi · Tokai",
    image: "/images/fuji-night-1920.webp",
    alt: "Mount Fuji framed by the Chureito Pagoda at Arakurayama Sengen Park",
    summary:
      "The hillside park brings together the red Chureito Pagoda and a distant view of Mount Fuji. Cherry blossoms color the scene in spring; autumn leaves offer a different seasonal frame.",
    detailLabel: "Getting there",
    detail: "Take the Fujikyuko Line to Shimoyoshida Station; the viewpoint is uphill.",
    regionId: "tokai",
    source: "https://www.japan.travel/en/spot/1334/",
  },
];
export default function Page() {
  return (
    <div className="home-shell editorial explore-page">
      <Header />
      <main id="main">
        <section className="explore-hero discovery-hero">
          <div className="explore-hero-picture">
            <img
              src="/images/fuji-night-1920.webp"
              alt="Mount Fuji beyond Chureito Pagoda at dusk"
              fetchPriority="high"
              data-photo-drift
            />
          </div>
          <div className="explore-hero-copy">
            <h1>A whole country awaits.</h1>
            <p>
              All 47 prefectures. Find a region that speaks to you, then follow
              the journey a little further.
            </p>
            <a href="#destinations" className="button">
              See famous places ↓
            </a>
          </div>
          <Kintsugi right variant={1} />
        </section>
        <section
          id="destinations"
          className="explore-wrap destination-guide"
          aria-labelledby="destination-heading"
        >
          <div className="destination-introduction" data-enter>
            <div>
              <h2 id="destination-heading">Start with the places you know.</h2>
              <p>
                A few of Japan’s best-loved stops, with a little context to
                help you choose what fits your trip.
              </p>
            </div>
            <nav className="destination-jump" aria-label="Jump to a destination">
              {destinations.map((destination) => (
                <a key={destination.id} href={`#${destination.id}`}>
                  {destination.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="destination-stories">
            {destinations.map((destination, index) => (
              <article
                className={`destination-story ${index % 2 ? "reverse" : ""}`}
                id={destination.id}
                key={destination.id}
                data-enter
              >
                <div className="destination-story-image">
                  <img
                    src={destination.image}
                    alt={destination.alt}
                    loading="lazy"
                    data-photo-drift
                  />
                </div>
                <div className="destination-story-copy">
                  <p className="destination-place">{destination.place}</p>
                  <h3>{destination.name}</h3>
                  <p className="destination-summary">{destination.summary}</p>
                  <div className="destination-detail">
                    <strong>{destination.detailLabel}</strong>
                    <span>{destination.detail}</span>
                  </div>
                  <div className="destination-links">
                    <a href={destination.source} target="_blank" rel="noreferrer">
                      Official visitor guide ↗
                    </a>
                    <a href={`#${destination.regionId}`}>
                      More in this region ↓
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="regions" className="explore-wrap region-directory">
          <div className="region-introduction" data-enter>
            <h2>Find your way across Japan.</h2>
            <p>
              Ten regions, each with a different rhythm. Browse the photographs
              and places below, then follow the official guide or open a city
              rail map to keep planning.
            </p>
            <Link className="text-link" href="/metro/">
              Open the Japan rail atlas ↗
            </Link>
          </div>
          <nav className="region-jump" aria-label="Regions of Japan">
            {regions.map((r) => (
              <a key={r.id} href={"#" + r.id}>
                {r.name}
              </a>
            ))}
          </nav>
          <div className="region-grid">
            {regions.map((r) => {
              const portrait = regionPortraits[r.id];
              return (
                <article className="region-card" id={r.id} key={r.id} data-enter>
                  <div className="region-card-photo">
                    <img src={portrait.image} alt={portrait.alt} loading="lazy" />
                    <span>{portrait.photoPlace}</span>
                  </div>
                  <div className="region-card-copy">
                    <h3>{r.name}</h3>
                    <p className="region-card-lead">{portrait.lead}</p>
                    <div className="region-highlights">
                      <h4>Places to start</h4>
                      <ul>
                        {portrait.highlights.map((place) => (
                          <li key={place.name}>
                            <strong>{place.name}</strong>
                            <span>{place.detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <PrefectureExplorer
                      regionId={r.id}
                      regionName={r.name}
                      prefectures={r.prefectures}
                    />
                    <div className="region-actions">
                      <a href={r.sources[0].url} target="_blank" rel="noreferrer">
                        Explore {r.name} ↗
                      </a>
                      {r.cities.map((c) => (
                        <Link
                          key={c}
                          href={"/metro/?city=" + encodeURIComponent(c)}
                        >
                          {c === "Naha" ? "Naha · Okinawa" : c} rail map ↗
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="region-scope">
            Regional grouping and highlight ideas: JNTO guides, checked 25
            October 2026. Guides open on the official tourism site. Our editable
            itineraries currently offer three sample routes; nationwide trip
            scheduling is still to come.
          </p>
          <Link href="/trips/" className="button secondary">
            Browse sample itineraries ↗
          </Link>
        </section>
      </main>
      <Footer />
      <ExploreMotion />
    </div>
  );
}
