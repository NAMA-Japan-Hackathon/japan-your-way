"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PreferencesForm } from "./preferences";
import { AIPlanner, AISavedPlans, useTravel } from "./travel-assistant";
import {
  Header,
  Footer,
  Status,
  Modal,
  ArrowUpRight,
  ArrowRight,
  Check,
  Plus,
  X,
  Bookmark,
  AlertCircle,
} from "./shared";
import {
  Clock,
  MapPin,
  Share2,
  RotateCcw,
  MoreHorizontal,
  Footprints,
  TrainFront,
  Utensils,
  Coffee,
  Lock,
  Unlock,
  Copy,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import {
  Plan,
  Preferences,
  Item,
  defaultPreferences,
  generate,
  readPlans,
  savePlan,
  STORAGE_KEY,
  checkPlan,
  aggregate,
  estimatePlan,
  money,
  time,
  duration,
  dateLabel,
  removeItem,
  replaceItem,
  moveItem,
  catalogue,
  experiences,
  assess,
  costFor,
  summary,
} from "@/lib/planner";
type Panel =
  | { kind: "evidence" | "edit"; item: Item }
  | { kind: "share" | "confirmation" | "add" | "rename" }
  | null;
export function Planner() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [generating, setGenerating] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("sample") === "1") {
      setPlan(generate(defaultPreferences, "sample-plan"));
      setLoaded(true);
      return;
    }
    const id = query.get("id");
    if (id) {
      const found = readPlans().find((x) => x.id === id);
      if (found) setPlan(found);
      else setMissing(true);
    }
    setLoaded(true);
  }, []);
  function create(p: Preferences) {
    setGenerating(true);
    setTimeout(() => {
      const next = generate(p, crypto.randomUUID());
      setPlan(next);
      setEditingPrefs(false);
      setGenerating(false);
      history.replaceState(null, "", "/plan/");
      window.scrollTo(0, 0);
    }, 350);
  }
  if (loaded && !plan && !missing && !generating && !editingPrefs)
    return <AIPlanner />;
  return (
    <>
      <Header compact />
      <noscript>
        <p className="notice">
          The editable planner needs JavaScript. You can still explore the
          sample trips and their estimates.
        </p>
      </noscript>
      {!loaded ? (
        <main id="main" className="page">
          <p>Opening your planning space…</p>
        </main>
      ) : generating ? (
        <main id="main" className="generating">
          <div className="route-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h1>Finding your way.</h1>
          <p role="status">
            Checking days, journeys, and the details that matter.
          </p>
        </main>
      ) : missing ? (
        <main id="main" className="page empty-state">
          <h1>This plan isn’t on this device.</h1>
          <p>
            Saved plans live in the browser where you made them. Try that device
            or start a new plan.
          </p>
          <button
            className="button"
            onClick={() => {
              setMissing(false);
              history.replaceState(null, "", "/plan/");
            }}
          >
            Start a plan
          </button>
        </main>
      ) : !plan || editingPrefs ? (
        <PreferencesForm
          initial={editingPrefs ? plan?.preferences : undefined}
          onComplete={create}
        />
      ) : (
        <PlanEditor
          plan={plan}
          setPlan={setPlan}
          editPreferences={() => setEditingPrefs(true)}
        />
      )}
      <Footer />
    </>
  );
}
function PlanEditor({
  plan,
  setPlan,
  editPreferences,
}: {
  plan: Plan;
  setPlan: (p: Plan) => void;
  editPreferences: () => void;
}) {
  const [day, setDay] = useState(0);
  const [tab, setTab] = useState("Day");
  const [panel, setPanel] = useState<Panel>(null);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [undo, setUndo] = useState<Plan | null>(null);
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [chosen, setChosen] = useState("");
  const [moveTo, setMoveTo] = useState(day);
  const [editTime, setEditTime] = useState("");
  const [rename, setRename] = useState(plan.name);
  const [shareFallback, setShareFallback] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const est = estimatePlan(plan),
    checks = checkPlan(plan),
    current = plan.days[day] || plan.days[0];
  const dayChecks = checks.filter((c) => c.day === day);
  const visitCount = current.items.filter((i) => i.kind === "visit").length;
  useEffect(() => {
    setSaved(readPlans().some((p) => p.id === plan.id));
  }, [plan.id]);
  function persist(next: Plan) {
    try {
      savePlan(next);
      setSaved(true);
      setMessage("Saved on this device.");
      history.replaceState(null, "", `/plan/?id=${next.id}`);
    } catch {
      setMessage(
        "This browser could not save your plan. Your edits are still here; copy a summary to keep them.",
      );
    }
  }
  function update(next: Plan, label: string) {
    const prev = estimatePlan(plan).subtotal,
      nextAmount = estimatePlan(next).subtotal;
    setUndo(plan);
    setPlan(next);
    setMessage(
      `${label}${prev !== nextAmount ? ` ${money(Math.abs(nextAmount - prev))} ${nextAmount > prev ? "more" : "less"} than your previous plan.` : ""}`,
    );
    if (saved) {
      try {
        savePlan(next);
      } catch {
        setMessage(
          "Your edit is here, but could not be saved on this device. Copy a summary to keep it.",
        );
      }
    }
  }
  function showEdit(item: Item) {
    setPanel({ kind: "edit", item });
    setChosen("");
    setMoveTo(day);
    setEditTime(time(item.start));
    setMessage("");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(summary(plan, includeSensitive));
      setMessage("Summary copied.");
    } catch {
      setShareFallback(true);
      setMessage("Copy the summary below.");
    }
  }
  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan.name,
          text: summary(plan, includeSensitive),
        });
        setMessage("Share sheet opened.");
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setShareFallback(true);
          setMessage("Sharing was unavailable. Copy the summary below.");
        }
      }
    } else await copy();
  }
  function regenerate() {
    const generated = generate(plan.preferences, plan.id, plan.name);
    generated.createdAt = plan.createdAt;
    plan.days.forEach((d, i) => {
      const locked = d.items.filter((x) => x.locked);
      if (locked.length)
        generated.days[i].items = [
          ...generated.days[i].items.filter(
            (x) => !locked.some((l) => l.id === x.id),
          ),
          ...locked,
        ].sort((a, b) => a.start - b.start);
    });
    update(
      generated,
      "Rebuilt the sample route. Locked items stayed in place; review any new conflicts.",
    );
  }
  function close() {
    setPanel(null);
    setPrepared(false);
    setIncludeSensitive(false);
    setShareFallback(false);
    setDeletePending(false);
  }
  return (
    <main id="main" className="planner-page">
      <div className="planner-title">
        <div>
          <Link href="/trips/" className="text-link">
            ← Explore trips
          </Link>
          <div className="plan-name-row">
            <h1>{plan.name}</h1>
            <button
              className="icon-button"
              aria-label="Rename plan"
              onClick={() => {
                setRename(plan.name);
                setPanel({ kind: "rename" });
              }}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          <p>
            {dateLabel(plan.preferences.arrival)} –{" "}
            {dateLabel(plan.preferences.departure)} · {est.people} travelers ·{" "}
            {plan.preferences.pace.toLowerCase()} pace
          </p>
        </div>
        <div className="plan-utilities">
          <button
            className="utility-button"
            aria-label="Share plan"
            onClick={() => {
              setPanel({ kind: "share" });
              setIncludeSensitive(false);
            }}
          >
            <Share2 size={16} />{" "}
            <span className="mobile-button-label">Share</span>
          </button>
          <button
            className="button dark"
            aria-label={saved ? "Save changes" : "Save plan"}
            onClick={() => persist(plan)}
          >
            <Bookmark size={16} />
            <span className="mobile-button-label">
              {saved ? "Save changes" : "Save plan"}
            </span>
          </button>
        </div>
      </div>
      <div className="demo-strip">
        <span>Sample plan · invented prices and unconfirmed arrangements</span>
        <span>{saved ? "Saved on this device" : "Not saved yet"}</span>
      </div>
      <div className="plan-feedback" aria-live="polite">
        {message && <span>{message}</span>}
        {undo && (
          <button
            className="text-button"
            onClick={() => {
              const previous = undo;
              setPlan(previous);
              if (saved) persist(previous);
              setUndo(null);
              setMessage("Last edit undone.");
            }}
          >
            <RotateCcw size={14} />
            Undo last edit
          </button>
        )}
      </div>
      <div className="planner-grid">
        <aside className="days-nav">
          <div className="aside-heading">
            <h2>Your route</h2>
            <span>{plan.days.length} days</span>
          </div>
          <label className="mobile-day-select">
            Your day
            <select
              value={day}
              onChange={(event) => {
                setDay(Number(event.target.value));
                setTab("Day");
              }}
            >
              {plan.days.map((d, i) => (
                <option key={d.date} value={i}>
                  Day {i + 1} · {d.city} · {dateLabel(d.date)}
                </option>
              ))}
            </select>
          </label>
          <nav aria-label="Itinerary days">
            {plan.days.map((d, i) => (
              <button
                key={d.date}
                onClick={() => {
                  setDay(i);
                  setTab("Day");
                }}
                className={day === i ? "active" : ""}
                aria-current={day === i ? "date" : undefined}
              >
                <span className="day-numeral">{i + 1}</span>
                <span>
                  <strong>{d.city}</strong>
                  <span>{dateLabel(d.date)}</span>
                </span>
                {day === i && <ArrowRight size={15} />}
              </button>
            ))}
          </nav>
          <button
            className="text-button preferences-link"
            onClick={editPreferences}
          >
            Edit requirements
          </button>
          <button className="text-button" onClick={regenerate}>
            <RotateCcw size={14} /> Rebuild route
          </button>
        </aside>
        <div className="mobile-plan-summary">
          <span>
            {est.missing ? "Known subtotal" : "Sample estimate"}{" "}
            <strong>{money(est.subtotal)}</strong>
          </span>
          <button className="text-button" onClick={() => setTab("Questions")}>
            {checks.length} open checks
          </button>
        </div>
        <div className="mobile-tabs" role="tablist" aria-label="Planner views">
          {["Day", "Estimate", "Questions"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <section
          className={`schedule-panel mobile-${tab === "Day" ? "show" : "hide"}`}
        >
          <div className="day-title">
            <div>
              <p className="secondary">
                Day {day + 1} · {dateLabel(current.date)} · Japan time
              </p>
              <h2>{current.city}, at your pace.</h2>
            </div>
            <Status state={aggregate(dayChecks)} />
          </div>
          <div className="day-facts">
            <span>
              <MapPin size={15} />
              {visitCount} {visitCount === 1 ? "visit" : "visits"}
            </span>
            <span>
              <Clock size={15} />
              {duration(current.items.reduce((s, i) => s + i.duration, 0))}{" "}
              scheduled
            </span>
            <span>{plan.preferences.pace} pace</span>
          </div>
          {dayChecks.some((c) => c.state === "Conflict") && (
            <div className="inline-conflict" role="alert">
              This day has a conflict. Open the questions to see what needs
              changing.
              <button
                className="text-button"
                onClick={() => {
                  setTab("Questions");
                  document
                    .getElementById("plan-questions")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Review conflicts
              </button>
            </div>
          )}
          <div className="schedule-list">
            {current.items.map((item) => {
              const Icon =
                item.kind === "meal"
                  ? Utensils
                  : item.kind === "travel"
                    ? TrainFront
                    : item.kind === "break"
                      ? Coffee
                      : MapPin;
              const rowChecks = dayChecks.filter((c) =>
                c.id.startsWith(item.id),
              );
              const state = aggregate(rowChecks);
              return (
                <article
                  className={`schedule-item kind-${item.kind}`}
                  key={item.id}
                >
                  <time>{time(item.start)}</time>
                  <div className="schedule-marker">
                    <Icon size={16} />
                  </div>
                  <div className="item-content">
                    <div className="item-title">
                      <h3>{item.title}</h3>
                      {item.locked && <Lock size={13} aria-label="Locked" />}
                    </div>
                    <p>
                      {duration(item.duration)}
                      {item.cost === null
                        ? " · Not priced"
                        : item.cost > 0
                          ? ` · ${money(item.cost)} group`
                          : ""}
                    </p>
                    {(item.kind === "visit" || item.kind === "meal") && (
                      <div className="item-details">
                        <Status state={state} small />
                        <button
                          className="text-button"
                          onClick={() => setPanel({ kind: "evidence", item })}
                        >
                          Why this status?
                        </button>
                      </div>
                    )}
                    {item.kind === "meal" && item.cost === null && (
                      <p className="pending-note">
                        Your food requirements stay in place. A provider needs
                        to confirm this meal.
                      </p>
                    )}
                  </div>
                  <button
                    className="icon-button edit-row"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => showEdit(item)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </article>
              );
            })}
          </div>
          <button
            className="add-item"
            onClick={() => {
              setChosen("");
              setPanel({ kind: "add" });
            }}
          >
            <Plus size={17} /> Add an experience
          </button>
          <div className="day-end">
            <CheckCircle2 size={17} />
            <p>
              Room for the unplanned.
              <span>
                Leave the rest of the evening open, or add something you love.
              </span>
            </p>
          </div>
        </section>
        <aside className="plan-right">
          <section
            className={`estimate-panel mobile-${tab === "Estimate" ? "show" : "hide"}`}
          >
            <div className="aside-heading">
              <h2>Your estimate</h2>
              <span>INR</span>
            </div>
            <span className="estimate-label">
              {est.missing ? "Known group subtotal" : "Sample group estimate"}
            </span>
            <strong className="estimate-value">{money(est.subtotal)}</strong>
            <p>{money(est.average)} average per traveler</p>
            {est.missing > 0 && (
              <p className="estimate-incomplete">
                <AlertCircle size={14} />
                {est.missing} {est.missing === 1 ? "item" : "items"} still need
                a price
              </p>
            )}
            <div className="estimate-breakdown">
              {est.categories.map((c) => (
                <div className="cost-row" key={c.name}>
                  <span>
                    {c.name}
                    <small>{c.basis}</small>
                  </span>
                  <span>{money(c.amount)}</span>
                </div>
              ))}
            </div>
            <div className="budget-line">
              <span>Group limit</span>
              <span>{money(plan.preferences.budget)}</span>
            </div>
            <p className={est.difference < 0 ? "negative" : "secondary"}>
              {est.difference < 0
                ? `${money(-est.difference)} over your limit`
                : `${money(est.difference)} below your limit before unpriced costs`}
            </p>
            <details className="cost-scope">
              <summary>What’s included and excluded?</summary>
              <p>
                Includes sample room, meal, visit, and journey allowances.
                Excludes international flights, visas, insurance, shopping, and
                unlisted fees. No live exchange rate is used. Per-person average
                is not an individual quote.
              </p>
            </details>
          </section>
          <section
            id="plan-questions"
            className={`questions-panel mobile-${tab === "Questions" ? "show" : "hide"}`}
          >
            <div className="aside-heading">
              <h2>Before you decide</h2>
              <Status state={aggregate(checks)} small />
            </div>
            <p>
              {checks.length} open checks across the trip. Actual arrangements
              remain unconfirmed.
            </p>
            <div className="question-list">
              {checks
                .filter((c) => c.state === "Conflict")
                .concat(checks.filter((c) => c.state !== "Conflict"))
                .slice(0, 4)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (c.day !== undefined) {
                        setDay(c.day);
                        setTab("Day");
                        const item = plan.days[c.day].items.find((i) =>
                          c.id.startsWith(i.id),
                        );
                        if (item) setPanel({ kind: "evidence", item });
                      } else setPanel({ kind: "confirmation" });
                    }}
                  >
                    <span
                      className={
                        c.state === "Conflict"
                          ? "question-dot conflict-dot"
                          : "question-dot"
                      }
                    />
                    <span>
                      <strong>{c.title}</strong>
                      <span>{c.reason}</span>
                    </span>
                    <ArrowUpRight size={15} />
                  </button>
                ))}
            </div>
            <button
              className="button full-width dark"
              onClick={() => {
                setPrepared(false);
                setPanel({ kind: "confirmation" });
              }}
            >
              Review questions <ArrowRight size={17} />
            </button>
            <p className="fine-print">
              Prepare a demo inquiry. Nothing is sent.
            </p>
          </section>
        </aside>
      </div>
      {panel && (
        <Modal
          title={
            panel.kind === "evidence"
              ? "Why this status?"
              : panel.kind === "edit"
                ? "Make this day yours"
                : panel.kind === "share"
                  ? "Share the possibility"
                  : panel.kind === "confirmation"
                    ? prepared
                      ? "Your demo request is ready"
                      : "Before asking a provider"
                    : panel.kind === "rename"
                      ? "Name your plan"
                      : "Add to your day"
          }
          onClose={close}
        >
          {panel.kind === "evidence" && (
            <>
              <h3>{panel.item.title}</h3>
              <Status
                state={aggregate(
                  checks.filter((c) => c.id.startsWith(panel.item.id)),
                )}
              />
              {checks
                .filter((c) => c.id.startsWith(panel.item.id))
                .map((c) => (
                  <p key={c.id}>{c.reason}</p>
                ))}
              {!checks.some((c) => c.id.startsWith(panel.item.id)) && (
                <p>
                  Matches your stated preferences under the sample assumptions.
                  This is not provider confirmation.
                </p>
              )}
              <div className="evidence-record">
                <div>
                  <span>Evidence type</span>
                  <strong>Demo fixture</strong>
                </div>
                <div>
                  <span>Catalogue version</span>
                  <strong>{plan.catalogue}</strong>
                </div>
                <div>
                  <span>Last provider check</span>
                  <strong>Not checked</strong>
                </div>
                <div>
                  <span>Actual availability</span>
                  <strong>Unknown</strong>
                </div>
              </div>
              {panel.item.experienceId && (
                <p>{experiences[panel.item.experienceId]?.note}</p>
              )}
              <p className="notice">
                This demo shows how evidence will work. No supplier, ingredient
                list, price, or access arrangement has been verified.
              </p>
              <button
                className="button dark"
                onClick={() => showEdit(panel.item)}
              >
                Change this item
              </button>
            </>
          )}
          {panel.kind === "edit" && (
            <>
              <h3>{panel.item.title}</h3>
              <p>
                Changes recalculate costs and keep any new conflicts visible.
              </p>
              <label>
                Start time in Japan
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                />
              </label>
              <button
                className="secondary-button button"
                onClick={() => {
                  const [h, m] = editTime.split(":").map(Number);
                  if (!Number.isFinite(h) || !Number.isFinite(m)) return;
                  update(
                    {
                      ...plan,
                      days: plan.days.map((d, i) =>
                        i === day
                          ? {
                              ...d,
                              items: d.items
                                .map((x) =>
                                  x.id === panel.item.id
                                    ? { ...x, start: h * 60 + m }
                                    : x,
                                )
                                .sort((a, b) => a.start - b.start),
                            }
                          : d,
                      ),
                    },
                    "Time changed.",
                  );
                  close();
                }}
              >
                Apply time
              </button>
              {panel.item.kind !== "travel" && panel.item.kind !== "break" && (
                <>
                  <label>
                    Replace with
                    <select
                      value={chosen}
                      onChange={(e) => setChosen(e.target.value)}
                    >
                      <option value="">Choose an alternative</option>
                      {catalogue
                        .filter(
                          (e) =>
                            e.city === current.city &&
                            e.kind === panel.item.kind &&
                            e.id !== panel.item.experienceId,
                        )
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title} ·{" "}
                            {assess(e, plan.preferences, current.date).fit} ·{" "}
                            {e.adult === null
                              ? "Not priced"
                              : money(costFor(e, plan.preferences) || 0)}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    className="button secondary-button"
                    disabled={!chosen || panel.item.locked}
                    onClick={() => {
                      update(
                        replaceItem(plan, day, panel.item.id, chosen),
                        "Experience replaced.",
                      );
                      close();
                    }}
                  >
                    Replace item
                  </button>
                  <label>
                    Move to another day
                    <select
                      value={moveTo}
                      onChange={(e) => setMoveTo(Number(e.target.value))}
                    >
                      {plan.days.map(
                        (d, i) =>
                          d.city === current.city && (
                            <option key={d.date} value={i}>
                              Day {i + 1} · {d.city}
                            </option>
                          ),
                      )}
                    </select>
                  </label>
                  <button
                    className="button secondary-button"
                    disabled={moveTo === day || panel.item.locked}
                    onClick={() => {
                      try {
                        update(
                          moveItem(plan, day, panel.item.id, moveTo),
                          "Item moved; journey allowances need review.",
                        );
                        close();
                      } catch (e) {
                        setMessage((e as Error).message);
                      }
                    }}
                  >
                    Move item
                  </button>
                </>
              )}
              <div className="modal-action-row">
                <button
                  className="text-button"
                  onClick={() => {
                    update(
                      {
                        ...plan,
                        days: plan.days.map((d, i) =>
                          i === day
                            ? {
                                ...d,
                                items: d.items.map((x) =>
                                  x.id === panel.item.id
                                    ? { ...x, locked: !x.locked }
                                    : x,
                                ),
                              }
                            : d,
                        ),
                      },
                      panel.item.locked
                        ? "Item unlocked."
                        : "Item locked for route rebuilds.",
                    );
                    close();
                  }}
                >
                  {panel.item.locked ? (
                    <Unlock size={16} />
                  ) : (
                    <Lock size={16} />
                  )}{" "}
                  {panel.item.locked ? "Unlock" : "Lock"} item
                </button>
                <button
                  className="text-button negative"
                  disabled={panel.item.locked}
                  onClick={() => {
                    update(
                      removeItem(plan, day, panel.item.id),
                      "Item removed.",
                    );
                    close();
                  }}
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
              {panel.item.locked && (
                <p className="field-help">
                  Unlock this item before replacing, moving, or removing it.
                </p>
              )}
            </>
          )}
          {panel.kind === "add" && (
            <>
              <p>
                Choose an experience in {current.city}. We’ll add it after the
                last scheduled item and check its fit.
              </p>
              <label>
                Experience
                <select
                  value={chosen}
                  onChange={(e) => setChosen(e.target.value)}
                >
                  <option value="">Choose an experience</option>
                  {catalogue
                    .filter((e) => e.city === current.city)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} ·{" "}
                        {assess(e, plan.preferences, current.date).fit}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="button dark"
                disabled={!chosen}
                onClick={() => {
                  const e = experiences[chosen];
                  const start = current.items.length
                    ? Math.max(
                        ...current.items.map((i) => i.start + i.duration),
                      ) + 20
                    : 540;
                  const item: Item = {
                    id: crypto.randomUUID(),
                    experienceId: e.id,
                    title: e.title,
                    kind: e.kind,
                    start,
                    duration: e.minutes,
                    cost: costFor(e, plan.preferences),
                    ...assess(e, plan.preferences, current.date),
                  };
                  update(
                    {
                      ...plan,
                      days: plan.days.map((d, i) =>
                        i === day ? { ...d, items: [...d.items, item] } : d,
                      ),
                    },
                    "Experience added. Confirm the new journey and any conflicts.",
                  );
                  close();
                }}
              >
                Add experience
              </button>
            </>
          )}
          {panel.kind === "share" && (
            <>
              <p>
                A readable snapshot for someone you’re planning with. Saved-plan
                links only work on your own device.
              </p>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={includeSensitive}
                  onChange={(e) => setIncludeSensitive(e.target.checked)}
                />
                <span>Include food and access requirements</span>
              </label>
              <textarea
                className="share-text"
                readOnly
                value={summary(plan, includeSensitive)}
                aria-label="Plan summary"
                rows={10}
              />
              <div className="modal-action-row">
                <button className="button dark" onClick={nativeShare}>
                  <Share2 size={16} />
                  Share summary
                </button>
                <button className="button secondary-button" onClick={copy}>
                  <Copy size={16} />
                  Copy
                </button>
              </div>
              {shareFallback && <p>Select and copy the summary above.</p>}
            </>
          )}
          {panel.kind === "confirmation" && (
            <>
              <p className="notice">
                Demo request — nothing will be sent. No contact details or
                payment are needed.
              </p>
              {!prepared ? (
                <>
                  <h3>{plan.name}</h3>
                  <p>
                    {dateLabel(plan.preferences.arrival)} –{" "}
                    {dateLabel(plan.preferences.departure)} · {est.people}{" "}
                    travelers
                  </p>
                  <p>
                    {est.missing ? "Known subtotal" : "Sample estimate"}:{" "}
                    {money(est.subtotal)}. {est.missing} unpriced items.
                  </p>
                  <h3>Questions for a provider</h3>
                  <ul className="confirmation-questions">
                    <li>
                      Confirm actual availability, prices, taxes, and
                      cancellation terms.
                    </li>
                    <li>
                      Confirm opening hours, journey durations, and transport
                      access.
                    </li>
                    {est.missing > 0 && (
                      <li>
                        Select and price the {est.missing} unpriced items.
                      </li>
                    )}
                    {checks.some((c) => c.state === "Conflict") && (
                      <li>
                        Resolve the{" "}
                        {checks.filter((c) => c.state === "Conflict").length}{" "}
                        known conflicts before committing.
                      </li>
                    )}
                  </ul>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={includeSensitive}
                      onChange={(e) => setIncludeSensitive(e.target.checked)}
                    />
                    <span>
                      Include food and access notes in this demo inquiry
                    </span>
                  </label>
                  {includeSensitive && (
                    <p>
                      {plan.preferences.diet}; ingredient checks:{" "}
                      {plan.preferences.ingredients || "None stated"};
                      step-free:{" "}
                      {plan.preferences.stepFree ? "Required" : "Not required"}.
                    </p>
                  )}
                  <button
                    className="button dark"
                    onClick={() => setPrepared(true)}
                  >
                    Prepare demo request <ArrowRight size={17} />
                  </button>
                </>
              ) : (
                <>
                  <div className="prepared-mark">
                    <CheckCircle2 size={38} />
                  </div>
                  <p>
                    Your plan and questions are ready to review. No provider has
                    received this request.
                  </p>
                  <textarea
                    className="share-text"
                    readOnly
                    rows={8}
                    value={`DEMO INQUIRY — NOT SENT\n\n${summary(plan, includeSensitive)}\n\nPlease confirm actual availability, prices, operating hours, and all required arrangements.`}
                    aria-label="Prepared demo inquiry"
                  />
                  <button className="button secondary-button" onClick={close}>
                    Return to my plan
                  </button>
                </>
              )}
            </>
          )}
          {panel.kind === "rename" && (
            <>
              <label>
                Plan name
                <input
                  maxLength={60}
                  value={rename}
                  onChange={(e) => setRename(e.target.value)}
                />
              </label>
              <button
                className="button dark"
                disabled={!rename.trim()}
                onClick={() => {
                  update({ ...plan, name: rename.trim() }, "Plan renamed.");
                  close();
                }}
              >
                Save name
              </button>
            </>
          )}
          <div className="dialog-feedback" role="status">
            {panel.kind === "share" ? message : ""}
          </div>
        </Modal>
      )}
    </main>
  );
}
export function SavedPlans() {
  const travel = useTravel();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<Plan | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setPlans(readPlans());
    setReady(true);
  }, []);
  function remove(id: string) {
    const p = plans.find((x) => x.id === id)!;
    try {
      const next = plans.filter((x) => x.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setDeleted(p);
      setPlans(next);
      setPending(null);
      setMessage("Plan deleted from this device.");
    } catch {
      setMessage("Could not delete this plan. Try again.");
    }
  }
  return (
    <>
      <Header />
      <main id="main" className="page saved-page">
        <div className="page-intro">
          <h1>A possibility, saved.</h1>
          <p>
            Your plans, on this browser and device. Pick up where you left off.
          </p>
        </div>
        <AISavedPlans />
        {travel.storageError && (
          <p className="ai-error" role="status">
            {travel.storageError}
          </p>
        )}
        <div className="saved-feedback" role="status">
          {message}{" "}
          {deleted && (
            <button
              className="text-button"
              onClick={() => {
                try {
                  savePlan(deleted);
                  setPlans(readPlans());
                  setDeleted(null);
                  setMessage("Plan restored.");
                } catch {
                  setMessage("Could not restore the plan.");
                }
              }}
            >
              Undo deletion
            </button>
          )}
        </div>
        {!ready ? (
          <p>Opening saved plans…</p>
        ) : !plans.length && !travel.saved.length ? (
          <div className="empty-state">
            <Bookmark size={34} />
            <h2>Your Japan is still to come.</h2>
            <p>Once you save a plan, you’ll find it here. No account needed.</p>
            <Link className="button" href="/plan/">
              Plan my Japan <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="saved-list">
            {plans.map((p) => (
              <article key={p.id}>
                <div>
                  <h2>
                    <Link href={`/plan/?id=${p.id}`}>{p.name}</Link>
                  </h2>
                  <p>
                    {dateLabel(p.preferences.arrival)} –{" "}
                    {dateLabel(p.preferences.departure)} ·{" "}
                    {p.preferences.adults + p.preferences.children} travelers
                  </p>
                  <span className="secondary">
                    Known subtotal {money(estimatePlan(p).subtotal)} · Saved on
                    this device
                  </span>
                </div>
                <div className="saved-actions">
                  <Link
                    className="button secondary-button"
                    href={`/plan/?id=${p.id}`}
                  >
                    Open plan <ArrowUpRight size={16} />
                  </Link>
                  <button
                    className="text-button"
                    onClick={() => {
                      try {
                        savePlan({
                          ...p,
                          id: crypto.randomUUID(),
                          name: p.name + " — copy",
                        });
                        setPlans(readPlans());
                        setMessage("Plan duplicated.");
                      } catch {
                        setMessage("Could not duplicate this plan.");
                      }
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    className="icon-button negative"
                    aria-label={`Delete ${p.name}`}
                    onClick={() => setPending(p.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="notice">
          Clearing browser storage can remove these plans. Downloaded AI
          itineraries may include food and access notes; review them before
          sharing. Earlier sample-plan summaries exclude detailed requirements
          unless you choose to include them.
        </p>
      </main>
      <Footer />
      {pending && (
        <Modal title="Delete this saved plan?" onClose={() => setPending(null)}>
          <p>
            This removes “{plans.find((p) => p.id === pending)?.name}” from this
            browser. You can undo it immediately afterward.
          </p>
          <button className="button dark" onClick={() => remove(pending)}>
            Delete plan
          </button>
        </Modal>
      )}
    </>
  );
}
