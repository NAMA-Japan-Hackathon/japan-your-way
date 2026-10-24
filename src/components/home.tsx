"use client";
import { Kintsugi } from "./kintsugi";
import Link from "next/link";
import { useState } from "react";
import { PhotoHero, WindowScene, ScrollScenes } from "./scroll-scenes";
import { ArrowUpRight } from "./shared";
import { PrefectureExplorer } from "./prefecture-explorer";
import { PrefectureFinder } from "./prefecture-finder";
import { EarthJourney } from "./earth-journey";
import { Leaf, MapPin, TrainFront } from "lucide-react";

import regions from "@/data/regions.json";
import { regionPortraits } from "@/data/region-portraits";
import {
  activityFilters,
  regionActivityIdeas,
  type ActivityFilter,
} from "@/data/japan-activities";

const activityNames = Object.fromEntries(
  activityFilters.map(({ id, label }) => [id, label]),
);
const prefectureCount = regions.reduce(
  (total, region) => total + region.prefectures.length,
  0,
);

const FAQs = [
  [
    "Can you plan around my food needs?",
    "Yes. Tell the planner which ingredients and preparation methods you need to avoid. If ingredients or preparation are unconfirmed, the meal stays marked ‘Needs check’. A label alone never becomes a guarantee.",
  ],
  [
    "How much can I change the itinerary?",
    "Keep talking to your planner to refine the route, pace, food needs or overnight stops. Then create a revised itinerary from the full conversation.",
  ],
  [
    "Are the prices confirmed?",
    "Planning allowances are estimates. Connected price searches are shown separately with their source, trip details and check time. Confirm the final price and availability with the booking provider.",
  ],
  [
    "Where will my plan be saved?",
    "Your conversation and saved trips stay in this browser. Your answers are also sent to Groq so the assistant can respond. Download your itinerary to keep a separate copy.",
  ],
  [
    "Can I book or send an inquiry here?",
    "The planner helps you compare and prepare. Complete bookings directly with an airline or hotel provider; this website does not reserve rooms, sell tickets or take payment.",
  ],
];

export function Home() {
  const [activeActivity, setActiveActivity] = useState<ActivityFilter>("all");
  const visibleRegions = regions.map((region) => ({
    region,
    portrait: regionPortraits[region.id],
    ideas: regionActivityIdeas[region.id].filter(
      (idea) => activeActivity === "all" || idea.category === activeActivity,
    ),
  }));
  const visibleIdeaCount = visibleRegions.reduce(
    (total, { ideas }) => total + ideas.length,
    0,
  );

  return (
    <main id="main" className="marketing cinematic-home">
      <ScrollScenes />
      <PhotoHero />
      <EarthJourney />
      <section className="cinema-section country-discovery" id="explore-japan">
        <Kintsugi right variant={2} position="low" />
        <div className="cinema-heading">
          <h2 data-enter="line">Explore all of Japan, your way.</h2>
          <p data-enter="line">
            {prefectureCount} prefectures, ten regions, and plenty to do beyond
            the best-known cities. Choose an interest to find your starting
            points.
          </p>
        </div>
        <div className="activity-controls">
          <div
            role="group"
            aria-label="Filter Japan activities"
            className="activity-filters"
          >
            {activityFilters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                aria-pressed={activeActivity === filter.id}
                onClick={() => setActiveActivity(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="activity-count" aria-live="polite">
            {visibleIdeaCount} {visibleIdeaCount === 1 ? "idea" : "ideas"}{" "}
            across{" "}
            {visibleRegions.filter(({ ideas }) => ideas.length > 0).length}{" "}
            regions · all 47 prefectures available below
          </p>
        </div>
        <PrefectureFinder interest={activeActivity} />
        <div className="regional-journey">
          <div className="journey-progress" aria-hidden="true">
            <span className="journey-progress-fill" />
          </div>
          <div className="activity-grid">
            {visibleRegions.map(({ region, portrait, ideas }) => (
              <article
                key={region.id}
                id={`home-${region.id}`}
                className="activity-card"
                data-journey-card
              >
                <div className="activity-image">
                  <img src={portrait.image} alt={portrait.alt} loading="lazy" />
                  <span>{portrait.photoPlace}</span>
                </div>
                <div className="activity-copy">
                  <div className="activity-card-meta">
                    <span>
                      {region.prefectures.length}{" "}
                      {region.prefectures.length === 1
                        ? "prefecture"
                        : "prefectures"}
                    </span>
                    <span>
                      {ideas.length}{" "}
                      {ideas.length === 1 ? "activity" : "activities"}
                    </span>
                  </div>
                  <h3>{region.name}</h3>
                  <p className="activity-card-intro">{portrait.lead}</p>
                  <PrefectureExplorer
                    regionId={region.id}
                    regionName={region.name}
                    prefectures={region.prefectures}
                    interest={activeActivity}
                  />
                  {ideas.length ? (
                    <ul className="activity-ideas">
                      {ideas.map((idea) => (
                        <li key={idea.title}>
                          <span className="activity-idea-main">
                            <strong>{idea.title}</strong>
                            <span>{idea.place}</span>
                          </span>
                          <span className="activity-idea-category">
                            {activityNames[idea.category]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="activity-empty">
                      No curated {activityNames[activeActivity]?.toLowerCase()}{" "}
                      idea here yet. Choose a prefecture above or try another
                      interest.
                    </p>
                  )}
                  <Link
                    href={`/explore/#${region.id}`}
                    className="activity-link-label"
                  >
                    Explore {region.name} <ArrowUpRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
        <p className="activity-season-note">
          Festivals, flowers, snow sports and mountain routes depend on the
          season. Check current conditions before you go. For more ideas, browse
          the{" "}
          <a
            href="https://www.japan.travel/en/things-to-do/"
            target="_blank"
            rel="noreferrer"
          >
            full JNTO activity guide ↗
          </a>
          .
        </p>
        <div className="region-index-label">Open a regional guide</div>
        <div className="country-links" data-enter="row">
          {regions.map((r) => (
            <Link key={r.id} href={"/explore/#" + r.id}>
              {r.name}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
        <div className="country-actions" data-enter="line">
          <Link href="/explore/" className="button">
            Explore all Japan <ArrowUpRight size={18} />
          </Link>
          <Link href="/trips/" className="text-link">
            Browse sample trips <ArrowUpRight size={18} />
          </Link>
          <Link href="/metro/" className="text-link">
            Follow the rail atlas <ArrowUpRight size={18} />
          </Link>
        </div>
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
            A conversation that follows your answers. A route that follows you.
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
                Ask for a quieter afternoon or a different region. Refine the
                conversation, then create a new draft around your choices.
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
              Start with what you imagine. Bring the details that matter.
              <br />
              We’ll leave room for the unexpected.
            </p>
          </div>
          <div className="start-card ai-home-start" data-enter="card">
            <p>
              Tell us what draws you to Japan. We’ll follow your answers, one
              thoughtful question at a time.
            </p>
            <Link className="button" href="/plan/">
              Start the conversation <ArrowUpRight size={18} />
            </Link>
            <p>No fixed questionnaire · Your pace · Your Japan</p>
          </div>
        </div>
      </section>
    </main>
  );
}
