import Link from "next/link";
import { Header, Footer, ArrowUpRight, Status } from "./shared";
export function Information({ help = false }: { help?: boolean }) {
  return (
    <>
      <Header />
      <main id="main" className="page information-page">
        <div className="page-intro">
          <h1>
            {help ? "A clearer starting point." : "From possibility to a plan."}
          </h1>
          <p>
            {help
              ? "What the demo does, where your information goes, and what still needs a real-world check."
              : "Dates, meals, journeys, and costs. One decision you can understand."}
          </p>
        </div>
        {help ? (
          <div className="information-content">
            <section>
              <h2>Exploring and planning</h2>
              <p>
                This concept is built for first-time Indian couples and families
                considering Tokyo, Kyoto, and Osaka. The demo supports trips of
                5–10 days, with 1–6 travelers and child allowances for ages
                4–11.
              </p>
              <p>
                You can browse, generate a route, edit days, review costs, and
                save locally without an account or payment.
              </p>
            </section>
            <section>
              <h2>Sample data, visible limits</h2>
              <p>
                All prices, operating windows, transport allowances, and
                supplier arrangements are illustrative demo records. They have
                not been checked against current availability. There are no live
                partner integrations.
              </p>
              <p>
                Estimates exclude international flights, visas, insurance,
                shopping, and unlisted fees. Unpriced items are identified
                rather than counted as zero.
              </p>
            </section>
            <section>
              <h2>Food and access</h2>
              <p>
                Specify your actual requirements. The planner excludes known
                hard conflicts, and keeps missing evidence visible. A dietary
                label does not confirm ingredients, preparation, or
                cross-contact. This product cannot establish food safety or
                medical suitability.
              </p>
            </section>
            <section>
              <h2>Your information</h2>
              <p>
                Requirements and saved plans stay in your browser’s local
                storage. This demo does not send them to a partner, require
                contact details, or record behavioral analytics. A plan in local
                storage is not an encrypted vault; anyone using this browser
                profile may be able to open it.
              </p>
              <p>
                Delete individual plans from Saved plans or clear this website’s
                browser data. Sharing includes a readable plan summary; food and
                access details are excluded unless you choose to include them.
                Photos and fonts are served from the website itself.
              </p>
            </section>
            <section>
              <h2>Saving and sharing</h2>
              <p>
                Saved plans work on the device where you created them. Copy or
                share a summary for your companion. Sending a local plan URL to
                another device will not transfer the plan.
              </p>
            </section>
            <section>
              <h2>Before booking</h2>
              <p>
                A demo request prepares a preview only. Nothing is sent. A real
                provider must confirm availability, prices, food arrangements,
                access, and terms before you book or pay.
              </p>
            </section>
          </div>
        ) : (
          <div className="information-content">
            <section>
              <h2>Start with your needs</h2>
              <p>
                Choose dates, group size, interests, pace, food requirements,
                access needs, and a group spending limit. Mark the details that
                are must-haves.
              </p>
            </section>
            <section>
              <h2>Build a connected day</h2>
              <p>
                Rules filter incompatible experiences, rank the remaining
                choices, and schedule activities with journeys, meals, and
                breaks. The result is editable, with reasons alongside the
                choices.
              </p>
            </section>
            <section>
              <h2>Understand every status</h2>
              <div className="status-explanations">
                <div>
                  <Status state="Fits" />
                  <p>
                    Matches your stated requirement under the available
                    evidence. It is not a reservation.
                  </p>
                </div>
                <div>
                  <Status state="Needs check" />
                  <p>
                    Information is missing, unpriced, conditional, or
                    unconfirmed. The plan tells you what to ask.
                  </p>
                </div>
                <div>
                  <Status state="Conflict" />
                  <p>
                    A known mismatch needs a change. Review the alternative
                    instead of hiding the problem.
                  </p>
                </div>
              </div>
            </section>
            <section>
              <h2>Make it yours</h2>
              <p>
                Move, replace, or remove an experience. The schedule and group
                estimate update together. Save locally or share a snapshot when
                the possibility starts to feel right.
              </p>
            </section>
            <section>
              <h2>Ask the right questions</h2>
              <p>
                The demo prepares an inquiry with the route, scope, and
                outstanding questions. No provider is contacted and no booking
                is made.
              </p>
            </section>
          </div>
        )}
        <Link className="text-link" href="/plan/?sample=1">
          Open a sample plan <ArrowUpRight size={16} />
        </Link>
        <br />
        <Link className="button" href="/plan/">
          Plan my Japan <ArrowUpRight size={18} />
        </Link>
      </main>
      <Footer />
    </>
  );
}
