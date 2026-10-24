"use client";
import { Kintsugi } from "./kintsugi";
import Link from "next/link";
import { PhotoHero, WindowScene, ScrollScenes } from "./scroll-scenes";
import { ArrowUpRight } from "./shared";
import { Leaf, MapPin, TrainFront } from "lucide-react";

import regions from "@/data/regions.json";

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
  return (
    <main id="main" className="marketing cinematic-home">
      <ScrollScenes />
      <PhotoHero />
      <section className="cinema-section country-discovery" id="explore-japan">
        <Kintsugi right variant={2} position="low" />
        <div className="cinema-heading">
          <h2 data-enter="line">A whole country awaits.</h2>
          <p data-enter="line">
            Northern wilderness. Inland seas. Southern islands. Make room for
            Japan beyond the familiar route.
          </p>
        </div>
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
