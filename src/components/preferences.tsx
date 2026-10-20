"use client";
import { useState, useEffect } from "react";
import {
  Preferences,
  defaultPreferences,
  validate,
  trips,
  tripPreferences,
  dateLabel,
  dayCount,
  money,
} from "@/lib/planner";
import { ArrowRight, ArrowUpRight, Check } from "./shared";
const titles = [
  "Dates and company",
  "What draws you in?",
  "The details that matter",
  "A comfortable budget",
  "Your Japan, in a nutshell",
];
export function PreferencesForm({
  onComplete,
  initial,
}: {
  onComplete: (p: Preferences) => void;
  initial?: Preferences;
}) {
  const [p, setP] = useState<Preferences>(initial || defaultPreferences);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  useEffect(() => {
    if (initial) return;
    const q = new URLSearchParams(location.search);
    const trip = trips.find((t) => t.slug === q.get("trip"));
    setP(
      trip
        ? tripPreferences(trip)
        : {
            ...defaultPreferences,
            pace: q.get("pace") === "Balanced" ? "Balanced" : "Relaxed",
            diet:
              q.get("diet") === "No restriction"
                ? "No restriction"
                : "Vegetarian",
          },
    );
  }, [initial]);
  useEffect(() => {
    if (step > 0)
      document
        .getElementById("form-step-title")
        ?.focus({ preventScroll: true });
  }, [step]);
  function patch<K extends keyof Preferences>(k: K, v: Preferences[K]) {
    setP((s) => ({ ...s, [k]: v }));
    setErrors([]);
  }
  function next() {
    const all = validate(p);
    const relevant =
      step === 0
        ? all.filter((x) => x.includes("days") || x.includes("travelers"))
        : step === 1
          ? all.filter((x) => x.includes("interest"))
          : step === 3
            ? all.filter((x) => x.includes("spending"))
            : [];
    if (relevant.length) {
      setErrors(relevant);
      document.getElementById("form-errors")?.focus();
      return;
    }
    setStep(Math.min(4, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <main id="main" className="form-page">
      <div className="form-layout">
        <div className="form-main">
          <p className="form-progress">
            Your requirements <span>{step + 1} of 5</span>
          </p>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${(step + 1) * 20}%` }} />
          </div>
          <h1 id="form-step-title" tabIndex={-1}>
            {titles[step]}
          </h1>
          <p className="form-description">
            {
              [
                "Start with when you’ll be in Japan and who’s coming along.",
                "Choose what you love. We’ll leave room for the unexpected.",
                "Tell us what a good day needs to include. Unknowns will stay visible.",
                "Choose a group limit for your time in Japan. You’ll see what it covers.",
                "A quick check before we build your editable route.",
              ][step]
            }
          </p>
          <div id="form-errors" tabIndex={-1} role="alert">
            {errors.map((e) => (
              <p className="error-message" key={e}>
                {e}
              </p>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 4) {
                const es = validate(p);
                if (es.length) setErrors(es);
                else onComplete(p);
              } else next();
            }}
          >
            {step === 0 && (
              <>
                <div className="field-pair">
                  <label>
                    Arrival in Japan
                    <input
                      type="date"
                      required
                      value={p.arrival}
                      onChange={(e) => patch("arrival", e.target.value)}
                    />
                  </label>
                  <label>
                    Departure from Japan
                    <input
                      type="date"
                      required
                      value={p.departure}
                      onChange={(e) => patch("departure", e.target.value)}
                    />
                  </label>
                </div>
                <p className="field-help">
                  The demo covers 5–10 days in Tokyo, Kyoto, and Osaka. Dates
                  use Japan local time.
                </p>
                <div className="field-pair">
                  <label>
                    Adults
                    <input
                      type="number"
                      min="1"
                      max="6"
                      required
                      value={p.adults}
                      onChange={(e) => patch("adults", Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Children aged 4–11
                    <input
                      type="number"
                      min="0"
                      max="5"
                      required
                      value={p.children}
                      onChange={(e) =>
                        patch("children", Number(e.target.value))
                      }
                    />
                  </label>
                </div>
                <p className="field-help">
                  1–6 travelers. Demo child allowances cover ages 4–11 only.
                  Other ages need an individually checked plan.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <fieldset>
                  <legend>Your interests</legend>
                  <div className="choice-grid">
                    {["Culture", "Nature", "Anime", "Food", "Shopping"].map(
                      (i) => (
                        <button
                          key={i}
                          type="button"
                          className={`choice ${p.interests.includes(i) ? "selected" : ""}`}
                          aria-pressed={p.interests.includes(i)}
                          onClick={() =>
                            patch(
                              "interests",
                              p.interests.includes(i)
                                ? p.interests.filter((x) => x !== i)
                                : [...p.interests, i],
                            )
                          }
                        >
                          {i}
                          {p.interests.includes(i) && <Check size={16} />}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Your daily pace</legend>
                  <div className="pace-options">
                    {(["Relaxed", "Balanced", "Active"] as const).map(
                      (pace, i) => (
                        <label
                          key={pace}
                          className={
                            p.pace === pace
                              ? "pace-option selected"
                              : "pace-option"
                          }
                        >
                          <input
                            type="radio"
                            name="pace"
                            checked={p.pace === pace}
                            onChange={() => patch("pace", pace)}
                          />
                          <span>
                            <strong>{pace}</strong>
                            <span>
                              {
                                [
                                  "Fewer stops, longer pauses. About 6 scheduled hours.",
                                  "A little more exploring. About 8 scheduled hours.",
                                  "Fuller days. Up to 10 scheduled hours.",
                                ][i]
                              }
                            </span>
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>
              </>
            )}
            {step === 2 && (
              <>
                <label>
                  Food preference
                  <select
                    value={p.diet}
                    onChange={(e) => patch("diet", e.target.value)}
                  >
                    {[
                      "No restriction",
                      "Vegetarian",
                      "Vegan",
                      "Jain",
                      "Halal",
                    ].map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Ingredients or preparation to check
                  <input
                    value={p.ingredients}
                    placeholder="For example: fish stock, egg, onion"
                    maxLength={200}
                    onChange={(e) => patch("ingredients", e.target.value)}
                  />
                </label>
                <p className="field-help">
                  Presets are a starting point. Tell us your specific
                  requirements. This demo cannot establish food safety.
                </p>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={p.strictDiet}
                    onChange={(e) => patch("strictDiet", e.target.checked)}
                  />
                  <span>
                    <strong>Food requirements are a must-have</strong>
                    <span>
                      Keep meals open if the evidence isn’t sufficient.
                    </span>
                  </span>
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={p.stepFree}
                    onChange={(e) => patch("stepFree", e.target.checked)}
                  />
                  <span>
                    <strong>Step-free routes are required</strong>
                    <span>
                      Exclude known steps; keep unconfirmed access visible.
                    </span>
                  </span>
                </label>
                <p className="privacy-note">
                  These details stay in this browser. Sharing does not include
                  them unless you choose to.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <label>
                  Group spending limit in INR
                  <div className="money-input">
                    <span>₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={p.budget}
                      onChange={(e) => patch("budget", Number(e.target.value))}
                    />
                  </div>
                </label>
                <p className="field-help">
                  For all {p.adults + p.children} travelers together, not per
                  person.
                </p>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={p.strictBudget}
                    onChange={(e) => patch("strictBudget", e.target.checked)}
                  />
                  <span>
                    <strong>This is a strict maximum</strong>
                    <span>Unknown costs will prevent a budget-fit result.</span>
                  </span>
                </label>
                <div className="scope-note">
                  <h2>What’s in the estimate?</h2>
                  <p>
                    Japan accommodation, meal allowances, listed activities, and
                    scheduled journeys.
                  </p>
                  <h3>What’s outside it?</h3>
                  <p>
                    International flights, visas, insurance, shopping, and
                    unlisted fees. All prices are sample INR amounts.
                  </p>
                </div>
              </>
            )}
            {step === 4 && (
              <div className="review-answers">
                {[
                  {
                    title: "Dates and group",
                    value: `${dateLabel(p.arrival)} – ${dateLabel(p.departure)} · ${dayCount(p)} days · ${p.adults} adults${p.children ? `, ${p.children} children` : ""}`,
                    step: 0,
                  },
                  {
                    title: "Interests and pace",
                    value: `${p.interests.join(", ")} · ${p.pace}`,
                    step: 1,
                  },
                  {
                    title: "Food and access",
                    value: `${p.diet}. ${p.ingredients ? `Check ${p.ingredients}.` : ""} ${p.strictDiet ? "Food is a must-have." : ""} ${p.stepFree ? "Step-free required." : ""}`,
                    step: 2,
                  },
                  {
                    title: "Group spending limit",
                    value: `${money(p.budget)}${p.strictBudget ? " · Strict maximum" : ""}`,
                    step: 3,
                  },
                ].map((x) => (
                  <div key={x.title}>
                    <div>
                      <h2>{x.title}</h2>
                      <p>{x.value}</p>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setStep(x.step)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
                <p className="notice">
                  You’ll get a sample itinerary with open questions, not
                  confirmed arrangements. No sign-up or payment is needed.
                </p>
              </div>
            )}
            <div className="form-actions">
              {step > 0 ? (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="button">
                {step === 4 ? "Build my plan" : "Continue"}
                {step === 4 ? (
                  <ArrowUpRight size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
        <aside className="form-aside">
          <img
            src="/images/gion.webp"
            alt="A quiet wooden street in Kyoto"
            width="650"
            height="800"
          />
          <div>
            <p>
              A little structure.
              <br />A lot to look forward to.
            </p>
            <span>Tokyo → Kyoto → Osaka</span>
          </div>
          <div className="form-summary">
            <span>Your group</span>
            <strong>{p.adults + p.children} travelers</strong>
            <span>Your pace</span>
            <strong>{p.pace}</strong>
            <span>Group limit</span>
            <strong>{money(p.budget)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
