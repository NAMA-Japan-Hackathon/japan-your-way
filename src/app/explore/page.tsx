import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer } from "@/components/shared";
import { ExploreMotion } from "@/components/explore-shared";
import { Kintsugi } from "@/components/kintsugi";
import regions from "@/data/regions.json";
export const metadata: Metadata = {
  title: "Explore all Japan — Japan, Your Way",
  description:
    "Discover all 47 prefectures, from Hokkaido to Okinawa, with regional guides and Japan’s rail atlas.",
};
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
            <a href="#regions" className="button">
              Explore the regions ↓
            </a>
          </div>
          <Kintsugi right variant={1} />
        </section>
        <section id="regions" className="explore-wrap region-directory">
          <div className="region-introduction" data-enter>
            <h2>Where will Japan take you?</h2>
            <p>
              From Hokkaido to Okinawa, use these regional guides to begin. The
              rail atlas connects selected national hubs and ten detailed city
              networks.
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
          {regions.map((r) => (
            <article className="region-row" id={r.id} key={r.id} data-enter>
              <div>
                <h3>{r.name}</h3>
                <p>{r.description}</p>
              </div>
              <div>
                <p className="region-prefectures">
                  {r.prefectures.join(" · ")}
                </p>
                <div className="region-actions">
                  <a href={r.sources[0].url} target="_blank" rel="noreferrer">
                    Official regional guide ↗
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
          ))}
          <p className="region-scope">
            Regional grouping and destinations: JNTO, checked 24 October 2026.
            Guides open on the official tourism site. Our editable itineraries
            currently offer three sample routes; nationwide trip scheduling is
            still to come.
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
