import { Header, Footer } from "@/components/shared";
import credits from "../../../public/images/credits.json";
const files = ["kyoto", "gion", "garden", "tokyo", "osaka"];
export default function Page() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="page-intro">
          <h1>The places behind the plan.</h1>
          <p>
            Photography from Wikimedia Commons. These images show destinations,
            not affiliated providers or available packages.
          </p>
        </div>
        <div className="credits-list">
          {credits.map((c, i) => (
            <article className="credit" key={c.ref}>
              <img
                src={`/images/${files[i]}.webp`}
                width="600"
                height="400"
                alt={c.title}
              />
              <h2>{c.title}</h2>
              <p>By {c.creator}</p>
              <p>
                <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                  {c.license}
                </a>{" "}
                ·{" "}
                <a href={c.page} target="_blank" rel="noreferrer">
                  Original image and source
                </a>
              </p>
              <p>
                Resized, converted to WebP, and cropped in the website layout.
                Image adaptations remain available under the same license.
              </p>
              <a href={`/images/${files[i]}.webp`} download>
                Download adapted image
              </a>
            </article>
          ))}
        </div>
        <p className="notice">
          Hanken Grotesk is distributed under the SIL Open Font License.{" "}
          <a href="/fonts/OFL.txt">Read the font license</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
