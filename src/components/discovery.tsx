"use client";
import { useState } from "react";
import Link from "next/link";
import { Header, Footer, ArrowUpRight, ArrowRight, Status } from "./shared";
import {
  trips,
  Trip,
  generate,
  tripPreferences,
  estimatePlan,
  money,
  dateLabel,
} from "@/lib/planner";
export function Discovery() {
  const [month, setMonth] = useState("");
  const [interest, setInterest] = useState("");
  const [pace, setPace] = useState("");
  const found = trips.filter(
    (t) =>
      (!month || t.months.includes(Number(month))) &&
      (!interest || t.interests.includes(interest)) &&
      (!pace || t.pace === pace),
  );
  return (
    <>
      <Header />
      <main id="main" className="page discovery">
        <div className="page-intro">
          <h1>Find your way in.</h1>
          <p>
            Start with a sample route. Make the dates, the pace, and the little
            details your own.
          </p>
        </div>
        <div className="filter-row" data-ui>
          <label>
            Travel month
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Any month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label>
            What draws you in?
            <select
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
            >
              <option value="">All interests</option>
              {["Culture", "Nature", "Anime", "Shopping", "Food"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            Your pace
            <select value={pace} onChange={(e) => setPace(e.target.value)}>
              <option value="">Any pace</option>
              <option>Relaxed</option>
              <option>Balanced</option>
            </select>
          </label>
          <button
            className="text-button"
            onClick={() => {
              setMonth("");
              setInterest("");
              setPace("");
            }}
          >
            Clear filters
          </button>
        </div>
        <p className="results-count" aria-live="polite">
          {found.length} sample {found.length === 1 ? "route" : "routes"}
        </p>
        <div className="trip-results">
          {found.map((t) => (
            <TripRow key={t.slug} trip={t} />
          ))}
        </div>
        {!found.length && (
          <div className="empty-state">
            <h2>No routes match yet.</h2>
            <p>
              Try a different month, interest, or pace. Your choices are still
              here.
            </p>
            <button
              className="button"
              onClick={() => {
                setMonth("");
                setInterest("");
                setPace("");
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
        <p className="notice">
          These are sample routes, not available packages. Costs, operating
          hours, dietary arrangements, and access need provider confirmation.
        </p>
      </main>
      <Footer />
    </>
  );
}
function TripRow({ trip }: { trip: Trip }) {
  const est = estimatePlan(generate(tripPreferences(trip)));
  return (
    <article className="trip-result">
      <Link href={`/trips/${trip.slug}/`} className="result-image">
        <img
          src={trip.image}
          alt={`A view of ${trip.slug === "culture-at-your-pace" ? "Kyoto" : trip.slug === "a-family-route" ? "Tokyo" : "Osaka"}`}
          width="700"
          height="500"
        />
      </Link>
      <div className="result-content">
        <p>
          {trip.days} days · {trip.pace.toLowerCase()} pace
        </p>
        <h2>
          <Link href={`/trips/${trip.slug}/`}>{trip.title}</Link>
        </h2>
        <p>{trip.description}</p>
        <div className="route-text">
          Tokyo <ArrowRight size={14} /> Kyoto <ArrowRight size={14} /> Osaka
        </div>
        <p className="secondary">{trip.season}</p>
        <div className="result-bottom">
          <div>
            <span className="secondary">Known subtotal · 2 adults</span>
            <strong>
              {money(est.subtotal)} <small>group</small>
            </strong>
            <span>{money(est.average)} average / traveler</span>
          </div>
          <Link
            href={`/trips/${trip.slug}/`}
            className="button secondary-button"
          >
            View trip <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function TripDetail({ slug }: { slug: string }) {
  const trip = trips.find((t) => t.slug === slug)!;
  const plan = generate(tripPreferences(trip));
  const est = estimatePlan(plan);
  return (
    <>
      <Header />
      <main id="main" className="page trip-detail">
        <Link href="/trips/" className="text-link back-link">
          ← All sample trips
        </Link>
        <div className="detail-hero">
          <div>
            <p className="secondary">
              {trip.days} days · {trip.pace.toLowerCase()} pace
            </p>
            <h1>{trip.title}</h1>
            <p className="lead">{trip.description}</p>
            <div className="route-text">
              Tokyo <ArrowRight size={15} /> Kyoto <ArrowRight size={15} />{" "}
              Osaka
            </div>
            <Link className="button" href={`/plan/?trip=${trip.slug}`}>
              Use this trip <ArrowUpRight size={19} />
            </Link>
            <p className="secondary">
              Sample route. Change every detail before you decide.
            </p>
          </div>
          <img
            src={trip.image}
            alt="The destination’s streets and architecture"
            width="1000"
            height="800"
          />
        </div>
        <div className="detail-columns">
          <section>
            <h2>A route with room in it.</h2>
            <div className="route-days">
              {plan.days.map((d, i) => (
                <div key={d.date}>
                  <span>Day {i + 1}</span>
                  <div>
                    <h3>{d.city}</h3>
                    <p>
                      {d.items
                        .filter((x) => x.kind === "visit")
                        .map((x) => x.title)
                        .join(" · ")}
                    </p>
                    <span className="secondary">
                      Journeys, lunch, and breaks included in the schedule.
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <h2>Dates and seasons</h2>
            <p>
              {trip.season} The planner checks seasonal windows against your
              dates. Outdoor experiences have weather-dependent conditions, and
              specific events need confirmation for the actual year.
            </p>
            <h2>Food and access</h2>
            <p>
              Your requirements are checked individually. A restaurant category
              does not establish ingredient or preparation suitability. Unknown
              meal arrangements stay open for confirmation.
            </p>
            <Status state="Needs check" />
          </section>
          <aside className="detail-estimate" data-ui>
            <h2>Your sample estimate</h2>
            <p className="secondary">
              {dateLabel(plan.preferences.arrival)} –{" "}
              {dateLabel(plan.preferences.departure)} · 2 adults
            </p>
            <span className="estimate-label">Known group subtotal</span>
            <strong className="estimate-value">{money(est.subtotal)}</strong>
            <p>{money(est.average)} average per traveler</p>
            <Status state="Needs check" />
            <p>
              {est.missing} lunches not priced. Full cost is still incomplete.
            </p>
            {est.categories.map((c) => (
              <div className="cost-row" key={c.name}>
                <span>{c.name}</span>
                <span>{money(c.amount)}</span>
              </div>
            ))}
            <h3>Included allowances</h3>
            <p>Rooms, listed visits, priced meals, and scheduled journeys.</p>
            <h3>Excluded</h3>
            <p>
              International flights, visas, insurance, shopping, and unlisted
              fees.
            </p>
            <Link
              href={`/plan/?trip=${trip.slug}`}
              className="button full-width"
            >
              Use this trip <ArrowUpRight size={17} />
            </Link>
            <p className="fine-print">
              All amounts are invented INR demo allowances, not a quote. No
              availability has been checked.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
