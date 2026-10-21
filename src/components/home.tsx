"use client";
import { useState } from "react";
import { Kintsugi } from "./kintsugi";
import Link from "next/link";
import { PhotoHero, WindowScene, ScrollScenes } from "./scroll-scenes";
import { ArrowUpRight, ArrowRight, Check, Status } from "./shared";
import {
  Coffee,
  Leaf,
  MapPin,
  Footprints,
  Sun,
  TrainFront,
  Utensils,
} from "lucide-react";
import {
  estimatePlan,
  generate,
  money,
  trips,
  tripPreferences,
} from "@/lib/planner";

const days = [
  {
    name: "River paths & little lanes",
    place: "Central Kyoto",
    title: "A day along the river",
    morning: "A walk by the Kamo River",
    note: "Follow the water, with time to stop when something catches your eye.",
    afternoon: "Tea in a quiet courtyard",
    time: "14:00",
  },
  {
    name: "Gardens & temple mornings",
    place: "Higashiyama",
    title: "A quieter side of Kyoto",
    morning: "Ginkaku-ji’s garden paths",
    note: "Raked sand, moss, and the wooded slopes of eastern Kyoto.",
    afternoon: "An afternoon in the little lanes",
    time: "14:30",
  },
  {
    name: "Craft & a cup of tea",
    place: "Kyoto",
    title: "Made slowly, in Kyoto",
    morning: "A small-group craft workshop",
    note: "Make time for the details, from local materials to a maker’s process.",
    afternoon: "Tea and an indoor museum",
    time: "14:00",
  },
  {
    name: "Room for the unexpected",
    place: "Your choice",
    title: "Leave a little room",
    morning: "A garden, chosen by you",
    note: "Start with one place you love. Leave the rest of the morning open.",
    afternoon: "Your own Kyoto afternoon",
    time: "14:00",
  },
];
const FAQs = [
  [
    "Can you plan around my food needs?",
    "Yes. Choose a dietary preference and add the ingredients you avoid. If ingredients or preparation are unconfirmed, the meal stays marked ‘Needs check’. A label alone never becomes a guarantee.",
  ],
  [
    "How much can I change the itinerary?",
    "Every day is editable. Replace, move, lock, or remove an experience; journeys, conflicts, and known costs update alongside your choices.",
  ],
  [
    "Are the prices confirmed?",
    "This is a working concept with illustrative INR allowances. Unpriced items stay visible, and a real provider must confirm costs and availability before booking.",
  ],
  [
    "Where will my plan be saved?",
    "On this device, in this browser. You can reopen it from Saved plans and share a readable summary. Clearing your browser’s storage can remove it.",
  ],
  [
    "Can I book or send an inquiry here?",
    "You can prepare a sample inquiry and review its outstanding questions. Nothing is sent, and no booking or payment is made in this demo.",
  ],
];

export function SampleDay() {
  const [day, setDay] = useState(0);
  const [relaxed, setRelaxed] = useState(true);
  const [food, setFood] = useState(true);
  const selected = days[day];
  return (
    <div className="itinerary-composition" data-ui>
      <aside className="itinerary-controls" data-enter="left">
        <div className="itinerary-place">
          <MapPin size={18} />
          <span>Kyoto, at your pace</span>
        </div>
        <p>Four sample days. A little room to make them yours.</p>
        <div
          className="itinerary-days"
          role="group"
          aria-label="Choose a sample day"
        >
          {days.map((d, i) => (
            <button
              key={d.name}
              aria-pressed={day === i}
              onClick={() => setDay(i)}
            >
              <span>
                <small>Day {i + 1}</small>
                {d.name}
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
        <div className="itinerary-settings">
          <button
            className="preference-switch"
            aria-pressed={relaxed}
            onClick={() => setRelaxed(!relaxed)}
          >
            <Footprints size={17} />
            <span>
              {relaxed ? "Unhurried days" : "A little more exploring"}
            </span>
            <span
              className={`toggle-track ${relaxed ? "on" : ""}`}
              aria-hidden="true"
            >
              <i />
            </span>
          </button>
          <button
            className="preference-switch"
            aria-pressed={food}
            onClick={() => setFood(!food)}
          >
            <Leaf size={17} />
            <span>No fish stock</span>
            <span
              className={`toggle-track ${food ? "on" : ""}`}
              aria-hidden="true"
            >
              <i />
            </span>
          </button>
        </div>
        <p className="itinerary-footnote">
          Your requirements stay visible. Arrangements still need confirmation.
        </p>
      </aside>
      <div className="itinerary-timeline" data-enter="right">
        <div className="timeline-heading">
          <div>
            <span>{selected.place} · Sample day</span>
            <h3>{selected.title}</h3>
          </div>
          <span className="pace-note">
            <Footprints size={14} />
            {relaxed ? "Room to pause" : "Room to explore"}
          </span>
        </div>
        <div
          className="timeline-stops"
          aria-live="polite"
          key={`${day}-${relaxed}`}
        >
          <article>
            <Sun size={19} />
            <div>
              <div className="stop-title">
                <h4>{selected.morning}</h4>
                <span>09:00 – {relaxed ? "10:00" : "10:30"}</span>
              </div>
              <p>{selected.note}</p>
              <span className="stop-detail">
                {relaxed ? "An easy start" : "A longer walk"} · Local journey
                included
              </span>
            </div>
          </article>
          <article>
            <Utensils size={19} />
            <div>
              <div className="stop-title">
                <h4>
                  {food
                    ? "Lunch, with the right questions"
                    : "A place for lunch along the way"}
                </h4>
                <span>12:00 – 13:00</span>
              </div>
              <p>
                {food
                  ? "Fish stock, ingredients, and preparation remain open questions until a provider confirms them."
                  : "Choose your own lunch. Availability and prices still need to be checked."}
              </p>
              <Status state="Needs check" small />
            </div>
          </article>
          <article>
            <Coffee size={19} />
            <div>
              <div className="stop-title">
                <h4>{selected.afternoon}</h4>
                <span>
                  {selected.time} – {relaxed ? "15:15" : "16:00"}
                </span>
              </div>
              <p>
                {relaxed
                  ? "One good experience, with breathing room around it."
                  : "An extra stop, with time for the journey between."}
              </p>
              <span className="stop-detail">
                {relaxed ? "Unhurried pace" : "Balanced pace"} · Sample
                arrangement
              </span>
            </div>
          </article>
        </div>
        <div className="timeline-close">
          <span>
            <Check size={15} />
            Journeys, meals, and pauses belong in the plan.
          </span>
          <Link
            href={`/plan/?pace=${relaxed ? "Relaxed" : "Balanced"}&diet=${food ? "Vegetarian" : "No%20restriction"}`}
          >
            Customize this day <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}
export function Home() {
  return (
    <main id="main" className="marketing cinematic-home">
      <ScrollScenes />
      <PhotoHero />
      <section className="cinema-section itinerary-section" id="itinerary">
        <Kintsugi variant={0} position="high" />
        <div className="cinema-heading">
          <h2 data-enter="line">
            A little wonder.
            <br />A clearer plan.
          </h2>
          <p data-enter="line">
            The places are just the beginning. See how meals, journeys, and time
            to pause become a day that feels like yours.
          </p>
        </div>
        <SampleDay />
      </section>
      <section className="cinema-section collection-section" id="trips">
        <Kintsugi right variant={1} position="low" />
        <div className="cinema-heading">
          <div>
            <h2 data-enter="line">Your kind of Japan.</h2>
            <p data-enter="line">
              Three starting points. Every route is yours to change.
            </p>
          </div>
          <Link href="/trips/" className="text-link" data-enter="line">
            Explore all trips <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="cinema-collection">
          {trips.map((trip, i) => (
            <Link
              className="collection-story"
              href={`/trips/${trip.slug}/`}
              key={trip.slug}
              data-enter="card"
            >
              <div className="collection-picture" data-photo>
                <img
                  src={trip.image}
                  width="800"
                  height="650"
                  loading="lazy"
                  alt={
                    [
                      "Yasaka-dori and the pagoda in Kyoto",
                      "Asakusa temple district in Tokyo",
                      "Dotonbori’s illuminated canal in Osaka",
                    ][i]
                  }
                  data-drift
                />
                <span>
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <h3>{trip.title}</h3>
              <div className="collection-meta">
                {trip.days} days · {trip.pace.toLowerCase()} pace
              </div>
              <p>{trip.description}</p>
              <div className="collection-price">
                From{" "}
                {money(estimatePlan(generate(tripPreferences(trip))).average)}{" "}
                <span>/ traveler*</span>
              </div>
            </Link>
          ))}
        </div>
        <p className="cinema-caption" data-enter="line">
          *Illustrative INR allowances. Your plan shows exclusions and items
          still needing a price.
        </p>
      </section>
      <section className="cinema-section process-section" id="how-it-works">
        <Kintsugi variant={2} position="low" />
        <figure className="process-picture" data-enter="left">
          <div data-photo>
            <img
              src="/images/gion.webp"
              width="900"
              height="1100"
              alt="Wooden facades and stone paving in Kyoto’s Gion neighborhood"
              loading="lazy"
              data-drift
            />
          </div>
          <figcaption>
            Little lanes. Longer afternoons.
            <br />A plan with space to be there.
          </figcaption>
        </figure>
        <div className="process-copy">
          <h2 data-enter="line">
            How your Japan
            <br />
            comes together.
          </h2>
          <p className="process-lead" data-enter="line">
            A few things about you. A clearer view of the whole trip.
          </p>
          <div className="process-step" data-enter="left">
            <MapPin size={23} />
            <div>
              <h3>Start with what matters</h3>
              <p>
                Your dates, your company, your interests. Tell us what a good
                day needs to include.
              </p>
            </div>
          </div>
          <div className="process-step" data-enter="left">
            <Leaf size={23} />
            <div>
              <h3>Keep the details in view</h3>
              <p>
                Dietary questions, journey time, and missing prices stay
                alongside the plan, ready to check.
              </p>
            </div>
          </div>
          <div className="process-step" data-enter="left">
            <TrainFront size={23} />
            <div>
              <h3>Make every day your own</h3>
              <p>
                Move a visit. Slow an afternoon. See how your choices change the
                route and its known cost.
              </p>
            </div>
          </div>
          <Link href="/how-it-works/" className="text-link" data-enter="line">
            A little more about the planner <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <WindowScene />
      <section className="cinema-section cinema-faq" id="faq">
        <div className="center-heading">
          <h2 data-enter="line">A few good questions.</h2>
          <p data-enter="line">A little clarity before the journey begins.</p>
        </div>
        <Kintsugi right variant={0} position="high" />
        <div className="cinema-faq-list">
          {FAQs.map(([q, a]) => (
            <details key={q} data-enter="row">
              <summary>
                {q}
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="cinema-section cinema-closing" id="start">
        <img
          className="closing-landscape"
          src="/images/fuji-night-1920.webp"
          alt=""
          width="3840"
          height="2371"
          loading="lazy"
          data-drift
        />
        <div className="closing-shade" />
        <Kintsugi variant={1} position="low" />
        <div className="closing-inner">
          <div className="center-heading">
            <h2 data-enter="line">Find your kind of Japan.</h2>
            <p data-enter="line">
              Start with your pace. Bring the details that matter.
              <br />
              We’ll leave room for the unexpected.
            </p>
          </div>
          <form
            className="start-card"
            action="/plan/"
            method="get"
            data-enter="card"
          >
            <div className="start-fields">
              <label>
                Your ideal pace
                <select name="pace" defaultValue="Relaxed">
                  <option>Relaxed</option>
                  <option>Balanced</option>
                </select>
              </label>
              <label>
                Your food preference
                <select name="diet" defaultValue="Vegetarian">
                  <option>Vegetarian</option>
                  <option>No restriction</option>
                </select>
              </label>
            </div>
            <button className="button" type="submit">
              Start my Japan plan <ArrowUpRight size={18} />
            </button>
            <p>Explore freely · Saved on this device · No payment</p>
          </form>
        </div>
      </section>
    </main>
  );
}
