"use client";
import { useState } from "react";
import { SilhouetteHero, WindowScene, ScrollScenes } from "./scroll-scenes";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronRight,
  Status,
  Reveal,
} from "./shared";
import {
  MapPin,
  Clock,
  Footprints,
  Leaf,
  TrainFront,
  Utensils,
  Coffee,
  Sun,
  ArrowDown,
} from "lucide-react";
import {
  defaultPreferences,
  generate,
  estimatePlan,
  money,
  trips,
  tripPreferences,
} from "@/lib/planner";
const FAQs = [
  [
    "Can I explore for free?",
    "Yes. Explore routes, create a plan, and save it on this device without an account or payment.",
  ],
  [
    "Is the estimate a confirmed quote?",
    "No. All amounts in this demo are sample allowances. Your plan lists its scope, exclusions, and missing prices. A provider must confirm final arrangements.",
  ],
  [
    "What if I have specific food needs?",
    "Tell us your diet and ingredient exclusions. Where evidence is missing, the plan keeps the meal open and marks it “Needs check.” It never turns an unknown into a guarantee.",
  ],
  [
    "Can I change my itinerary?",
    "Yes. Replace, move, or remove activities. Travel time, conflicts, and costs update with your choices.",
  ],
  [
    "Where is my plan saved?",
    "In this browser, on this device. You can copy or share a summary. Clearing browser storage can remove saved plans.",
  ],
  [
    "Can I book through this website?",
    "This is a concept demo. You can prepare a sample confirmation request, but nothing is sent to a provider. Booking and payment are outside this demo.",
  ],
];
export function SampleDay() {
  const [pace, setPace] = useState("slow");
  const [food, setFood] = useState(true);
  return (
    <div className="day-preview" data-ui>
      <div className="preview-head">
        <span>
          <MapPin size={15} /> A day in Kyoto
        </span>
        <span className="preview-date">Your kind of day</span>
      </div>
      <div className="preview-controls">
        <button onClick={() => setPace("slow")} aria-pressed={pace === "slow"}>
          More time to pause
        </button>
        <button onClick={() => setPace("city")} aria-pressed={pace === "city"}>
          A little more exploring
        </button>
      </div>
      <div className="preview-route" key={pace}>
        <div className="preview-stop">
          <span className="stop-icon">
            <Sun size={18} />
          </span>
          <span>
            <small>09:00 · Start slowly</small>
            <strong>
              {pace === "slow"
                ? "A walk by the Kamo River"
                : "Higashiyama’s little lanes"}
            </strong>
            <span>
              {pace === "slow"
                ? "An hour outside, with nowhere to rush."
                : "Traditional streets, shops, and a longer walk."}
            </span>
          </span>
          <span className="stop-time">{pace === "slow" ? "1h" : "1h 30m"}</span>
        </div>
        <div className="journey">
          <span />
          10 min local journey
        </div>
        <div className="preview-stop">
          <span className="stop-icon">
            <Utensils size={18} />
          </span>
          <span>
            <small>12:00 · Lunch</small>
            <strong>
              {food
                ? "A meal that needs a check"
                : "Choose lunch along the way"}
            </strong>
            <span>
              {food
                ? "Fish stock and preparation: not confirmed."
                : "A flexible break. Your choice, your pace."}
            </span>
          </span>
          <Status state="Needs check" small />
        </div>
        <div className="journey">
          <span />A little breathing room
        </div>
        <div className="preview-stop">
          <span className="stop-icon">
            <Coffee size={18} />
          </span>
          <span>
            <small>14:00 · Take it in</small>
            <strong>
              {pace === "slow"
                ? "Tea and a quiet courtyard"
                : "An afternoon at the museum"}
            </strong>
            <span>
              {pace === "slow"
                ? "One good experience, with room around it."
                : "An indoor alternative if the weather changes."}
            </span>
          </span>
          <span className="stop-time">
            {pace === "slow" ? "1h 15m" : "1h 30m"}
          </span>
        </div>
      </div>
      <div className="preview-bottom">
        <button
          className="food-toggle"
          aria-pressed={food}
          onClick={() => setFood(!food)}
        >
          <span className={food ? "checkbox checked" : "checkbox"}>
            {food && <Check size={12} />}
          </span>
          <Leaf size={14} /> No fish stock
        </button>
        <span>Sample day · 2 travelers</span>
      </div>
      <Link
        className="preview-link"
        href={`/plan/?pace=${pace === "slow" ? "Relaxed" : "Balanced"}&diet=${food ? "Vegetarian" : "No%20restriction"}`}
      >
        Make this day yours <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
export function Home() {
  return (
    <main id="main" className="marketing">
      <Reveal />
      <ScrollScenes />
      <SilhouetteHero />
      <div className="intro-strip">
        <p data-reveal>
          Japan is the possibility.
          <br />
          <span>The right fit is personal.</span>
        </p>
        <p data-reveal>
          Find the places you’ll love. Understand the meals, journeys, and costs
          that make the whole trip work.
        </p>
        <a href="#trips" className="scroll-link" aria-label="See sample trips">
          <ArrowDown size={22} />
        </a>
      </div>
      <section id="trips" className="trip-section">
        <div className="section-heading">
          <h2 data-reveal>Start with a little wonder.</h2>
          <div data-reveal>
            <p>Three ways in. Every route is yours to change.</p>
            <Link href="/trips/" className="text-link">
              See all trips <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="trip-gallery">
          {trips.map((trip, i) => (
            <Link
              href={`/trips/${trip.slug}/`}
              className={`trip-story story-${i}`}
              key={trip.slug}
              data-reveal
            >
              <div className="trip-image">
                <img
                  src={trip.image}
                  alt={
                    i === 0
                      ? "The historic lanes and pagoda of Kyoto"
                      : i === 1
                        ? "Asakusa neighborhood and temple in Tokyo"
                        : "Osaka’s Dotonbori canal at night"
                  }
                  width="800"
                  height="600"
                  loading="lazy"
                />
                <span className="image-action" aria-label="View trip">
                  <ArrowUpRight size={24} />
                </span>
              </div>
              <h3>{trip.title}</h3>
              <div className="trip-meta">
                <span>
                  {trip.days} days · {trip.pace.toLowerCase()} pace
                </span>
                <span>Tokyo · Kyoto · Osaka</span>
              </div>
              <p>{trip.description}</p>
              <span className="trip-price">
                Known subtotal from{" "}
                {money(estimatePlan(generate(tripPreferences(trip))).average)}{" "}
                <span>/ traveler</span>
              </span>
            </Link>
          ))}
        </div>
        <p className="sample-caption">
          Illustrative routes and INR allowances. Unpriced items and exclusions
          are shown before you decide.
        </p>
      </section>
      <section className="fit-section">
        <div className="fit-image" data-reveal>
          <img
            src="/images/gion.webp"
            alt="Wooden facades along a quiet Gion lane in Kyoto"
            width="1000"
            height="1200"
            loading="lazy"
          />
        </div>
        <div className="fit-content">
          <h2 data-reveal>
            Good plans leave
            <br />
            less to guess.
          </h2>
          <p className="lead" data-reveal>
            Not just where to go. Whether the whole day works for you.
          </p>
          <div className="fit-fact" data-reveal>
            <h3>Your dates, in context</h3>
            <p>
              Seasonal possibilities, weather alternatives, and no promises of
              blossoms on a particular day.
            </p>
          </div>
          <div className="fit-fact" data-reveal>
            <h3>Your food needs, taken seriously</h3>
            <p>
              A vegetarian label is a starting point. Ingredient questions stay
              visible until someone can confirm them.
            </p>
          </div>
          <div className="fit-fact" data-reveal>
            <h3>Your pace, all day</h3>
            <p>
              Journeys and breaks belong in the plan, alongside the places you
              came to see.
            </p>
          </div>
          <div className="fit-fact" data-reveal>
            <h3>Your costs, in the open</h3>
            <p>
              Group totals, per-person averages, and what is still missing. All
              in one place.
            </p>
          </div>
        </div>
      </section>
      <WindowScene />
      <section className="evidence-section">
        <div className="section-heading">
          <h2 data-reveal>
            Clarity includes
            <br />
            the unknowns.
          </h2>
          <p data-reveal>
            Every plan tells you what fits, what needs checking, and what should
            change.
          </p>
        </div>
        <div className="evidence-board" data-ui>
          <div data-reveal>
            <Status state="Fits" />
            <h3>A little breathing room</h3>
            <p>
              A 30-minute break is included between visits. Your chosen pace
              shapes the schedule.
            </p>
          </div>
          <div data-reveal>
            <Status state="Needs check" />
            <h3>Know the question to ask</h3>
            <p>
              Lunch ingredients have not been confirmed. The meal stays open in
              your plan.
            </p>
          </div>
          <div data-reveal>
            <Status state="Conflict" />
            <h3>See a better alternative</h3>
            <p>
              A winter-only experience does not fit November dates. Choose
              something for your season.
            </p>
          </div>
        </div>
        <p className="sample-caption">
          Shown with sample data. Fit is a planning result, not confirmation of
          a booking or service.
        </p>
      </section>
      <section className="faq-section">
        <div>
          <h2 data-reveal>
            A few good
            <br />
            questions.
          </h2>
          <p data-reveal>A little more context before you start.</p>
        </div>
        <div className="faq-list">
          {FAQs.map(([q, a]) => (
            <details key={q} data-reveal>
              <summary>
                {q}
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="closing">
        <img
          src="/images/garden.webp"
          alt="Raked sand and green trees at Kyoto’s Ginkaku-ji garden"
          width="1600"
          height="800"
          loading="lazy"
        />
        <div className="closing-copy">
          <h2 data-reveal>
            Your kind
            <br />
            of Japan.
          </h2>
          <p data-reveal>Start with your dates. Find the trip that fits.</p>
          <Link href="/plan/" className="button" data-reveal>
            Plan my Japan <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
