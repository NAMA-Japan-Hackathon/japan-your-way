import type { Metadata } from "next";
import { Header, Footer } from "@/components/shared";
import { ExploreHero, ExploreMotion } from "@/components/explore-shared";
import { ReviewsHub } from "@/components/reviews-hub";
import kanto from "@/data/reviews/kanto.json";
import kansai from "@/data/reviews/kansai.json";
import shopping from "@/data/reviews/shopping.json";
import type { Restaurant } from "@/lib/explore";
export const metadata: Metadata = {
  title: "Food & shopping reviews — Japan, Your Way",
  description:
    "Dated restaurant recognition, verified plant-based menus and shopping places linked to English metro station guides.",
};
export default function Page() {
  return (
    <div className="home-shell editorial explore-page">
      <Header />
      <main id="main">
        <ExploreHero />
        <noscript>
          <style>{".reviews-workspace{display:none}"}</style>
        </noscript>
        <ReviewsHub
          initial={(kanto as Restaurant[]).slice(0, 24)}
          shopping={shopping}
        />
        <noscript>
          <section className="explore-wrap no-script-catalogue">
            <h2>Read the catalogue</h2>
            <p>
              Interactive filters and private notes need JavaScript. All sourced
              places remain readable below.
            </p>
            <h3>Food</h3>
            {[...kanto, ...kansai].map((r) => (
              <details key={r.id}>
                <summary>
                  {r.name} · {r.city}
                </summary>
                <p>{r.worthVisiting}</p>
                <p>{r.diet.notes}</p>
                <p>
                  Signature dish: {r.signatureDish.name}. {r.signatureDish.why}
                </p>
                <p>
                  Checked {r.checkedOn}. Price {r.priceBand}.
                </p>
                {r.sources.map((s) => (
                  <p key={s.url}>
                    <a href={s.url}>{s.title}</a>
                  </p>
                ))}
              </details>
            ))}
            <h3>Shopping</h3>
            {shopping.map((p) => (
              <details key={p.id}>
                <summary>
                  {p.name} · {p.city}
                </summary>
                <p>{p.summary}</p>
                <p>
                  {p.hours} {p.closed}
                </p>
                <a href={p.officialUrl}>Place reference</a>
              </details>
            ))}
          </section>
        </noscript>
      </main>
      <Footer />
      <ExploreMotion />
    </div>
  );
}
