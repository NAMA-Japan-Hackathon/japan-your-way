"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowUp,
  ArrowUpRight,
  MessageCircle,
  X,
  RotateCcw,
  Bookmark,
  Download,
  Check,
  Minus,
} from "lucide-react";
import { Header, Footer, Modal } from "./shared";
import {
  emptySession,
  OPENING,
  SESSION_KEY,
  SAVED_AI_KEY,
  profileRows,
  inr,
  matchesSchema,
  interviewSchema,
  validItinerary,
  validSearches,
  type TravelSession,
  type Interview,
  type Itinerary,
  type Message,
  type SearchResult,
} from "@/lib/travel";
import regions from "@/data/regions.json";
import { activityFilters } from "@/data/japan-activities";

function readSession(value: unknown): value is TravelSession {
  if (!value || typeof value !== "object") return false;
  const s = value as TravelSession;
  return (
    s.version === 1 &&
    typeof s.id === "string" &&
    typeof s.needsRevision === "boolean" &&
    Array.isArray(s.messages) &&
    Array.isArray(s.chat) &&
    [s.messages, s.chat].every(
      (list) =>
        list.length <= 80 &&
        list.every(
          (m) =>
            m &&
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string" &&
            m.content.length <= 6000,
        ),
    ) &&
    (!s.interview || matchesSchema(s.interview, interviewSchema)) &&
    (!s.itinerary || validItinerary(s.itinerary)) &&
    validSearches(s.searches)
  );
}
type TravelContext = {
  session: TravelSession;
  loaded: boolean;
  connected: boolean | null;
  busy: string;
  error: string;
  saved: TravelSession[];
  storageError: string;
  errorAction: string;
  retry: () => void;
  send: (
    mode: "interview" | "chat" | "generate",
    text?: string,
    retry?: boolean,
  ) => Promise<void>;
  checkPrices: () => Promise<void>;
  reset: () => void;
  clearChat: () => void;
  save: () => boolean;
  openSaved: (s: TravelSession) => void;
  deleteSaved: (id: string) => void;
};
const Context = createContext<TravelContext | null>(null);
export const useTravel = () => {
  const context = useContext(Context);
  if (!context) throw new Error("Travel provider missing");
  return context;
};
export function TravelProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<TravelSession>(emptySession);
  const [saved, setSaved] = useState<TravelSession[]>([]);
  const [loaded, setLoaded] = useState(false),
    [connected, setConnected] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [storageError, setStorageError] = useState("");
  const [errorAction, setErrorAction] = useState("");
  const inFlight = useRef(false);
  useEffect(() => {
    try {
      const active: unknown = JSON.parse(
        localStorage.getItem(SESSION_KEY) || "null",
      );
      if (readSession(active)) setSession(active);
      else setSession({ ...emptySession(), id: crypto.randomUUID() });
      const list: unknown = JSON.parse(
        localStorage.getItem(SAVED_AI_KEY) || "[]",
      );
      if (Array.isArray(list)) setSaved(list.filter(readSession));
    } catch {
      setStorageError(
        "This browser couldn’t restore your previous conversation. You can still plan here.",
      );
    }
    setLoaded(true);
    fetch("/api/travel/", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setConnected(data.connected === true))
      .catch(() => setConnected(false));
    const sync = (event: StorageEvent) => {
      if (inFlight.current || !event.newValue) return;
      try {
        const next: unknown = JSON.parse(event.newValue);
        if (event.key === SESSION_KEY && readSession(next)) setSession(next);
        if (event.key === SAVED_AI_KEY && Array.isArray(next))
          setSaved(next.filter(readSession));
      } catch {
        /* Ignore corrupt data from another browser tab. */
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      const serialized = JSON.stringify(session);
      if (localStorage.getItem(SESSION_KEY) !== serialized)
        localStorage.setItem(SESSION_KEY, serialized);
    } catch {
      setStorageError(
        "Your conversation is open, but this browser couldn’t save it. Download your itinerary to keep a copy.",
      );
    }
  }, [session, loaded]);
  async function post(path: string, body: unknown) {
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(
        path.includes("availability") ? 150000 : 90000,
      ),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw new Error(
        data?.error ||
          "The assistant couldn’t respond. Your message is still here; please retry.",
      );
    return data;
  }
  const performCheck = async (current: TravelSession) => {
    if (!current.itinerary || !current.interview || current.needsRevision)
      return;
    const data = await post("/api/travel/availability/", {
      profile: current.interview.profile,
      itinerary: current.itinerary,
    });
    setSession((s) =>
      s.itinerary === current.itinerary
        ? { ...s, searches: Array.isArray(data?.searches) ? data.searches : [] }
        : s,
    );
  };
  const send: TravelContext["send"] = async (
    mode,
    text = "",
    retry = false,
  ) => {
    if (
      inFlight.current ||
      !loaded ||
      (!text.trim() && mode !== "generate" && !retry)
    )
      return;
    inFlight.current = true;
    setBusy(mode);
    setError("");
    setErrorAction(mode);
    const field = mode === "chat" ? "chat" : "messages";
    const history = session[field];
    const messages: Message[] =
      mode === "generate"
        ? [
            ...session.messages,
            {
              role: "user",
              content:
                "Please generate or revise my full Japan trip now, using everything I have told you. Keep unknown details explicit.",
            },
          ]
        : retry
          ? history
          : [...history, { role: "user", content: text.trim() }];
    if (mode !== "generate") setSession((s) => ({ ...s, [field]: messages }));
    try {
      // Refresh the same-origin session cookie before a call, including after a long idle period.
      const status = await fetch("/api/travel/", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (status.ok) {
        const info = await status.json().catch(() => null);
        const isConn = info?.connected === true;
        setConnected(isConn);
        if (!isConn) {
          throw new Error(
            typeof info?.connectionError === "string"
              ? info.connectionError
              : "The Japan assistant isn’t connected yet. You can keep exploring and return to this conversation later.",
          );
        }
      }
      const data = await post("/api/travel/", {
        mode,
        messages,
        profile: session.interview?.profile || null,
        itinerary: mode === "chat" ? session.itinerary : null,
        searches: mode === "chat" ? session.searches : [],
      });
      if (mode === "generate") {
        const next = {
          ...session,
          itinerary: data as Itinerary,
          searches: [],
          needsRevision: false,
        };
        setSession((s) => ({
          ...s,
          itinerary: next.itinerary,
          searches: [],
          needsRevision: false,
        }));
        setBusy("prices");
        setErrorAction("prices");
        try {
          await performCheck(next);
        } catch (e) {
          setError(
            e instanceof Error
              ? e.message
              : "The itinerary is ready, but prices couldn’t be checked.",
          );
        }
      } else {
        setSession((s) => ({
          ...s,
          [field]: [...messages, { role: "assistant", content: data.message }],
          ...(mode === "interview"
            ? {
                interview: data as Interview,
                searches: [],
                needsRevision: Boolean(s.itinerary),
              }
            : {}),
        }));
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The connection was interrupted. Please retry.",
      );
    } finally {
      inFlight.current = false;
      setBusy("");
    }
  };
  const checkPrices = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy("prices");
    setError("");
    setErrorAction("prices");
    try {
      const status = await fetch("/api/travel/", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const statusData = status.ok
        ? await status.json().catch(() => null)
        : null;
      if (
        statusData &&
        !statusData.searchConnected &&
        !statusData.hotelConnected
      ) {
        throw new Error(
          "Live price checking is not configured yet. You can still plan and save your trip.",
        );
      }
      await performCheck(session);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Price check interrupted. Please retry.",
      );
    } finally {
      inFlight.current = false;
      setBusy("");
    }
  };
  function persistSaved(next: TravelSession[]) {
    try {
      localStorage.setItem(SAVED_AI_KEY, JSON.stringify(next));
      setSaved(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "This browser couldn’t save the trip. Download a copy instead.",
      );
      return false;
    }
  }
  const reset = () => {
    if (inFlight.current) return;
    setSession({ ...emptySession(), id: crypto.randomUUID() });
    setError("");
  };
  return (
    <Context.Provider
      value={{
        session,
        loaded,
        connected,
        busy,
        error,
        saved,
        storageError,
        errorAction,
        retry: () => {
          if (errorAction === "prices") void checkPrices();
          else
            void send(
              errorAction as "interview" | "chat" | "generate",
              "",
              errorAction !== "generate",
            );
        },
        send,
        checkPrices,
        reset,
        clearChat: () => {
          if (!inFlight.current) {
            setSession((s) => ({ ...s, chat: [] }));
            setError("");
          }
        },
        save: () => {
          if (session.itinerary)
            return persistSaved([
              { ...session, id: session.id || crypto.randomUUID() },
              ...saved.filter((s) => s.id !== session.id),
            ]);
          return false;
        },
        openSaved: (s) => {
          if (!inFlight.current) {
            setSession(s);
            setError("");
          }
        },
        deleteSaved: (id) => persistSaved(saved.filter((s) => s.id !== id)),
      }}
    >
      {children}
      <TravelChat />
    </Context.Provider>
  );
}

function Composer({
  onSend,
  disabled,
  label,
  compact = false,
}: {
  onSend: (text: string) => Promise<void>;
  disabled: boolean;
  label: string;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    const content = text;
    setText("");
    await onSend(content);
    ref.current?.focus({ preventScroll: true });
  }
  return (
    <form
      className={`ai-composer ${compact ? "compact-composer" : ""}`}
      onSubmit={submit}
    >
      <label htmlFor={compact ? "chat-answer" : "planner-answer"}>
        {label}
      </label>
      <div>
        <textarea
          id={compact ? "chat-answer" : "planner-answer"}
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={6000}
          rows={compact ? 2 : 3}
          placeholder={
            compact
              ? "Ask about your Japan trip…"
              : "Tell us in your own words…"
          }
          disabled={disabled}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={disabled || !text.trim()}
        >
          <ArrowUp size={20} />
        </button>
      </div>
      <p>
        {compact
          ? "Japan travel advice · AI can make mistakes"
          : "Enter to send · Shift + Enter for a new line · You can skip any question"}
      </p>
    </form>
  );
}
function Transcript({
  messages,
  compact = false,
  busy,
}: {
  messages: Message[];
  compact?: boolean;
  busy: boolean;
}) {
  const log = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  useEffect(() => {
    if (atBottom.current && log.current)
      log.current.scrollTop = log.current.scrollHeight;
  }, [messages.length, busy]);
  return (
    <div
      className={`ai-transcript ${compact ? "chat-transcript" : ""}`}
      ref={log}
      onScroll={() => {
        const el = log.current;
        if (el)
          atBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      }}
      role="log"
      aria-label={compact ? "Japan travel chat" : "Trip planning conversation"}
      aria-relevant="additions"
      aria-live="polite"
    >
      {messages.length ? (
        messages.map((m, i) => (
          <article className={`ai-message ${m.role}`} key={i}>
            <span>{m.role === "user" ? "You" : "Japan, Your Way · AI"}</span>
            <p>{m.content}</p>
          </article>
        ))
      ) : (
        <article className="ai-message assistant">
          <span>Japan, Your Way · AI</span>
          <p>
            {compact
              ? "Where would you like a little help? Ask about Japan, or about the trip you’re planning here."
              : OPENING}
          </p>
        </article>
      )}
      {busy && (
        <p className="ai-thinking" role="status">
          Considering your trip…
        </p>
      )}
    </div>
  );
}
const openingChoices = [
  "Culture, temples and traditional neighborhoods",
  "Mountains, nature and peaceful places",
  "Food, shopping and lively cities",
  "Anime, gaming and modern Japan",
  "An easygoing trip with family-friendly experiences",
  "A balanced first visit — help me discover what I like",
];

function AdaptiveQuestions() {
  const t = useTravel();
  const interview = t.session.interview;
  const [selected, setSelected] = useState("");
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const question = interview?.message || OPENING;
  const awaiting = t.session.messages.at(-1)?.role === "user";
  const disabled = Boolean(t.busy) || !t.loaded || awaiting;
  const choices = t.session.messages.length
    ? interview?.suggestions || []
    : openingChoices;
  useEffect(() => {
    setSelected("");
    setShowDates(false);
  }, [question, t.session.id]);
  const maxEnd = startDate
    ? new Date(Date.parse(startDate) + 59 * 86400000).toISOString().slice(0, 10)
    : undefined;
  const datesValid = Boolean(
    startDate &&
      endDate &&
      endDate >= startDate &&
      (!maxEnd || endDate <= maxEnd),
  );
  const answerCount = t.session.messages.filter(
    (m) => m.role === "user",
  ).length;
  return (
    <div className="ai-choice-flow">
      {t.session.messages.length > 0 && (
        <details className="ai-answer-history">
          <summary>Review your answers · {answerCount}</summary>
          <Transcript messages={t.session.messages} busy={false} />
        </details>
      )}
      <div
        className="ai-active-question"
        aria-live="polite"
        aria-busy={Boolean(t.busy)}
      >
        <h2>{awaiting ? "Shaping your next question…" : question}</h2>
        {awaiting ? (
          <p role="status">
            Your choices are helping us understand your trip.{" "}
            {t.error ? "Use Retry below to continue." : "One moment…"}
          </p>
        ) : interview?.ready ? (
          <p>
            Your travel brief is ready. Create your itinerary to get the full
            day-by-day plan and a detailed PDF.
          </p>
        ) : (
          <p>Choose one answer. The next question will follow your choice.</p>
        )}
      </div>
      {awaiting && !t.busy && !t.error && (
        <button
          className="button"
          onClick={() => void t.send("interview", "", true)}
        >
          Resume planning
        </button>
      )}
      {!awaiting && !interview?.ready && (
        <form
          className="ai-choice-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (selected && !disabled) void t.send("interview", selected);
          }}
        >
          <fieldset disabled={disabled}>
            <legend className="sr-only">Answer choices</legend>
            {choices.map((choice) => (
              <label
                className={`ai-choice ${selected === choice ? "is-selected" : ""}`}
                key={choice}
              >
                <input
                  type="radio"
                  name="trip-answer"
                  value={choice}
                  checked={selected === choice}
                  onChange={() => setSelected(choice)}
                />
                <span>{choice}</span>
                {selected === choice && <Check size={18} aria-hidden="true" />}
              </label>
            ))}
          </fieldset>
          {choices.length ? (
            <button
              className="button ai-choice-continue"
              type="submit"
              disabled={disabled || !selected}
            >
              Continue <ArrowUpRight size={17} />
            </button>
          ) : (
            <button
              className="button"
              type="button"
              disabled={disabled}
              onClick={() =>
                void t.send(
                  "interview",
                  "Show different choices for this question.",
                )
              }
            >
              Show my answer choices
            </button>
          )}
        </form>
      )}
      {!awaiting && t.session.messages.length > 0 && (
        <div className="ai-choice-tools">
          <button
            className="text-button"
            disabled={disabled}
            onClick={() =>
              void t.send(
                "interview",
                interview?.ready
                  ? "I would like to refine my trip. Ask which part I want to change, with answer choices."
                  : "Show different choices for this question.",
              )
            }
          >
            {interview?.ready
              ? "Refine my preferences"
              : "Show different choices"}
          </button>
          {!interview?.ready && (
            <button
              className="text-button"
              disabled={disabled}
              onClick={() =>
                void t.send(
                  "interview",
                  "I’m not sure. Skip this question for now and keep this detail undecided.",
                )
              }
            >
              Not sure / skip
            </button>
          )}
          <button
            className="text-button"
            disabled={disabled}
            onClick={() => setShowDates(!showDates)}
          >
            {showDates ? "Close calendar" : "Choose exact travel dates"}
          </button>
        </div>
      )}
      {showDates && !awaiting && (
        <form
          className="ai-date-choice"
          onSubmit={(e) => {
            e.preventDefault();
            if (datesValid && !disabled)
              void t.send(
                "interview",
                `My departure from home is ${startDate} and my departure from Japan is ${endDate}. Keep these exact dates and continue with answer choices.`,
              );
          }}
        >
          <p>
            Choose dates from the calendar, or close it to keep your timing
            flexible.
          </p>
          <label>
            Depart from home
            <input
              type="date"
              value={startDate}
              min={new Date().toLocaleDateString("en-CA")}
              disabled={disabled}
              onChange={(e) => {
                setStartDate(e.target.value);
                setEndDate("");
              }}
              required
            />
          </label>
          <label>
            Depart from Japan
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              max={maxEnd}
              disabled={disabled || !startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
          <button
            className="button"
            type="submit"
            disabled={disabled || !datesValid}
          >
            Use these dates
          </button>
        </form>
      )}
      {t.busy === "generate" && (
        <p className="ai-choice-status" role="status">
          Creating every day of your trip, with stays, transport and budget
          details…
        </p>
      )}
      {t.busy === "prices" && (
        <p className="ai-choice-status" role="status">
          Your itinerary is ready. Checking connected flight and hotel sources…
        </p>
      )}
    </div>
  );
}

export function AIPlanner() {
  const t = useTravel();
  const [resetOpen, setResetOpen] = useState(false),
    [view, setView] = useState<"conversation" | "itinerary">("conversation");
  const [startingPoint, setStartingPoint] = useState<{
    prefecture: string;
    region: string;
    interest: string;
  } | null>(null);
  const profile = t.session.interview?.profile;
  const draft = t.session.itinerary;
  const prevDraft = useRef(draft);
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("view") === "itinerary")
      setView("itinerary");
    const region = regions.find((item) => item.id === query.get("region"));
    const prefecture = query.get("prefecture");
    const interest = activityFilters.find((item) => item.id === query.get("interest"));
    if (region && prefecture && region.prefectures.includes(prefecture)) {
      setStartingPoint({ prefecture, region: region.name, interest: interest?.id === "all" ? "" : interest?.label || "" });
    }
  }, []);
  useEffect(() => {
    if (draft && draft !== prevDraft.current) setView("itinerary");
    prevDraft.current = draft;
  }, [draft]);
  return (
    <>
      <Header compact />
      <main id="main" className="ai-page">
        <div className="ai-titlebar">
          <div>
            <h1>Plan your Japan trip.</h1>
            <p>
              Choose what feels right. Every answer shapes what we ask next.
            </p>
          </div>
          <button
            className="text-button"
            onClick={() => setResetOpen(true)}
            disabled={Boolean(t.busy)}
          >
            <RotateCcw size={15} /> New trip
          </button>
        </div>
        {startingPoint && <div className="ai-starting-point" role="region" aria-label="Your selected starting point">
          <div>
            <strong>Bring your discovery into this plan</strong>
            <p>{startingPoint.prefecture} · {startingPoint.region}{startingPoint.interest ? ` · ${startingPoint.interest}` : ""}</p>
          </div>
          <div className="ai-starting-actions">
            <button
              type="button"
              className="button"
              disabled={!t.loaded || Boolean(t.busy)}
              onClick={() => {
                const message = `I would like to include ${startingPoint.prefecture} in ${startingPoint.region} in my Japan trip${startingPoint.interest ? `, with a focus on ${startingPoint.interest.toLowerCase()}` : ""}. Help me plan around this starting point and ask what else matters to me.`;
                void t.send("interview", message);
                setStartingPoint(null);
                history.replaceState(null, "", "/plan/");
              }}
            >
              Use this starting point <ArrowUpRight size={17} />
            </button>
            <button type="button" className="text-button" onClick={() => {
              setStartingPoint(null);
              history.replaceState(null, "", "/plan/");
            }}>Skip this choice</button>
          </div>
        </div>}
        <noscript>
          <p className="notice">
            The AI planner needs JavaScript. Explore Japan and its rail atlas
            while planning your route.
          </p>
        </noscript>
        {t.storageError && (
          <p className="ai-error" role="status">
            {t.storageError}
          </p>
        )}
        <div className="ai-workspace">
          <section className="ai-main" aria-label="Plan your Japan trip">
            <div
              className="ai-view-tabs"
              role="group"
              aria-label="Planning views"
            >
              <button
                aria-pressed={view === "conversation"}
                onClick={() => setView("conversation")}
              >
                Your preferences
              </button>
              <button
                aria-pressed={view === "itinerary"}
                onClick={() => setView("itinerary")}
                disabled={!draft}
              >
                Your itinerary{draft ? ` · ${draft.days.length} days` : ""}
              </button>
            </div>
            {view === "conversation" ? (
              <>
                <AdaptiveQuestions />
                <p className="ai-privacy">
                  Your conversation is saved in this browser and sent to Groq to
                  respond. Optional food and access details stay part of your
                  trip context. Please leave out private documents and payment
                  details.{" "}
                  <Link href="/help/">How your information is used</Link>
                </p>
              </>
            ) : (
              draft && <ItineraryView />
            )}
            {t.error && t.errorAction !== "chat" && (
              <div className="ai-error" role="alert">
                <p>{t.error}</p>
                <button
                  className="text-button"
                  disabled={Boolean(t.busy)}
                  onClick={t.retry}
                >
                  Retry
                </button>
              </div>
            )}
          </section>
          <aside
            className="ai-understood"
            aria-label="What we have learned about your trip"
          >
            <h2>What makes it yours.</h2>
            {profile ? (
              <>
                <p>{profile.summary}</p>
                <dl>
                  {profileRows(profile).map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <>
                <p>Your choices will build a personal travel brief here.</p>
                <ul className="ai-context-prompts">
                  <li>The places that draw you in</li>
                  <li>The people you’re traveling with</li>
                  <li>Your pace, budget and everyday needs</li>
                </ul>
              </>
            )}
            {t.session.interview?.ready && (
              <p className="ai-ready">
                <Check size={16} /> Ready for a first draft. You can keep
                refining.
              </p>
            )}
            <button
              className="button"
              disabled={Boolean(t.busy) || !t.session.interview?.ready}
              onClick={() => void t.send("generate")}
            >
              {t.busy === "generate"
                ? "Creating your route…"
                : t.busy === "prices"
                  ? "Checking price sources…"
                  : draft
                    ? "Revise my itinerary"
                    : "Create my itinerary"}
              <ArrowUpRight size={17} />
            </button>
            <p className="ai-small">
              {t.session.interview
                ? t.session.interview.ready
                  ? "Your detailed PDF will include every day, budget, stays and booking checks."
                  : "Keep choosing so we can build a route around you. You can leave details undecided."
                : "Choose your first answer. We’ll narrow down the details together."}
            </p>
            {t.connected === false && (
              <p className="ai-connection">
                The AI connection isn’t available yet. Explore{" "}
                <Link href="/explore/">all Japan</Link> in the meantime.
              </p>
            )}
          </aside>
        </div>
      </main>
      <Footer />
      {resetOpen && (
        <Modal
          title="Start a new Japan trip?"
          onClose={() => setResetOpen(false)}
        >
          <p>
            This clears the current conversation and unsaved draft on this
            device. Trips you saved separately will remain.
          </p>
          <button
            className="button"
            onClick={() => {
              t.reset();
              setView("conversation");
              setResetOpen(false);
            }}
          >
            Start a new trip
          </button>
          <button className="text-button" onClick={() => setResetOpen(false)}>
            Keep planning
          </button>
        </Modal>
      )}
    </>
  );
}

function ItineraryView() {
  const t = useTravel(),
    plan = t.session.itinerary!;
  const [notice, setNotice] = useState("");
  const [downloading, setDownloading] = useState(false);
  async function download() {
    if (downloading) return;
    setDownloading(true);
    try {
      const { downloadTripPdf } = await import("@/lib/trip-pdf");
      await downloadTripPdf(t.session);
      setNotice("Your detailed trip PDF has been downloaded.");
    } catch {
      setNotice(
        "The PDF couldn’t be downloaded. Please try again; your trip is still here.",
      );
    } finally {
      setDownloading(false);
    }
  }
  const estimatedLow = plan.budget.reduce((sum, b) => sum + b.lowINR, 0),
    estimatedHigh = plan.budget.reduce((sum, b) => sum + b.highINR, 0);
  return (
    <div className="ai-itinerary">
      {t.session.needsRevision && (
        <p className="ai-error">
          Your preferences have changed since this draft. Use Revise my
          itinerary to apply them before checking prices.
        </p>
      )}
      <div className="ai-draft-head">
        <span>AI planning draft · no reservations</span>
        <h2>{plan.title}</h2>
        <p>{plan.summary}</p>
        <div className="ai-trip-actions">
          <button
            className="text-button"
            onClick={() => {
              setNotice(
                t.save()
                  ? "Saved on this device."
                  : "This browser couldn’t save your trip. Download a copy instead.",
              );
            }}
          >
            <Bookmark size={16} /> Save trip
          </button>
          <button
            className="button"
            onClick={() => void download()}
            disabled={downloading || t.busy === "prices"}
          >
            <Download size={16} />{" "}
            {downloading
              ? "Preparing PDF…"
              : t.busy === "prices"
                ? "Checking booking sources…"
                : "Download detailed PDF"}
          </button>
          <Link href="/saved/">
            Saved trips <ArrowUpRight size={16} />
          </Link>
        </div>
        <p className="ai-small" role="status">
          {notice}
        </p>
      </div>
      <div className="ai-days">
        {plan.days.map((d) => (
          <article key={d.day}>
            <div className="ai-day-label">
              <span>Day {d.day}</span>
              <span>{d.date || "Dates flexible"}</span>
            </div>
            <h3>{d.place}</h3>
            <dl>
              {[
                ["Morning", d.morning],
                ["Afternoon", d.afternoon],
                ["Evening", d.evening],
                ["Getting around", d.transport],
                ["Food", d.food],
                ["Overnight", d.stayCity],
              ].map(
                ([k, v]) =>
                  v && (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ),
              )}
            </dl>
            {d.notes && <p className="ai-day-note">{d.notes}</p>}
          </article>
        ))}
      </div>
      <section className="ai-budget">
        <h3>Planning allowances.</h3>
        <p>
          Estimated group costs in INR. These are AI estimates; unpriced items
          and exclusions remain outside this subtotal.
        </p>
        <dl>
          {plan.budget.map((b, i) => (
            <div key={i}>
              <dt>
                {b.label}
                <small>{b.basis}</small>
              </dt>
              <dd>
                {inr(b.lowINR)}–{inr(b.highINR)}
              </dd>
            </div>
          ))}
          <div className="ai-budget-total">
            <dt>Estimated subtotal</dt>
            <dd>
              {inr(estimatedLow)}–{inr(estimatedHigh)}
            </dd>
          </div>
        </dl>
      </section>
      <section className="ai-price-checks">
        <div>
          <h3>Hotel & flight checks.</h3>
          <button
            className="text-button"
            disabled={Boolean(t.busy) || t.session.needsRevision}
            onClick={() => void t.checkPrices()}
          >
            {t.busy === "prices" ? "Checking…" : "Check again"}
          </button>
        </div>
        <p>
          Searches use the dates, airports and occupancy in your trip profile. A
          search result is a snapshot, not a reservation or a guarantee of
          availability.
        </p>
        {t.session.searches.length ? (
          t.session.searches.map((s, i) => <SearchCard key={i} search={s} />)
        ) : (
          <p className="ai-connection">
            {t.busy === "prices"
              ? "Checking connected price sources…"
              : "No current price search is attached to this draft. Use Check again after confirming dates and travelers."}
          </p>
        )}
        <div className="ai-booking-links">
          <span>Compare directly · availability not checked here</span>
          <a
            href="https://www.makemytrip.com/international-flights/"
            target="_blank"
            rel="noopener noreferrer"
          >
            MakeMyTrip flights ↗
          </a>
          <a
            href="https://www.makemytrip.com/hotels-international/japan-hotels.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            MakeMyTrip hotels ↗
          </a>
          <a
            href="https://www.agoda.com/country/japan.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agoda Japan ↗
          </a>
          <a
            href="https://www.jal.co.jp/in/en/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Japan Airlines ↗
          </a>
          <a
            href="https://www.ana.co.jp/en/in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ANA ↗
          </a>
        </div>
      </section>
      <section className="ai-unresolved">
        <h3>Before you book.</h3>
        <ul>
          {plan.unresolved.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
        <p>
          Confirm current schedules, entry rules, dietary arrangements and
          access with the relevant provider.
        </p>
        <details>
          <summary>Official destination references</summary>
          <ul>
            {regions.map((r) => (
              <li key={r.id}>
                <a
                  href={r.sources[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.sources[0].title} ↗
                </a>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}
function HotelOfferPhoto({
  url,
  name,
  scope,
}: {
  url?: string;
  name: string;
  scope: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  const place = /kyoto|gion/i.test(scope)
    ? "gion"
    : /osaka/i.test(scope)
      ? "osaka"
      : "tokyo";
  const contextual = !url || failed;
  return (
    <figure className="ai-hotel-photo">
      <img
        src={contextual ? `/images/${place}.webp` : url}
        alt={
          contextual
            ? "Japan street scene, an illustrative destination photograph"
            : `${name}, photograph from the hotel search source`
        }
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={contextual ? undefined : () => setFailed(true)}
      />
      <figcaption>
        {contextual
          ? "Japan area · illustrative photo"
          : "Hotel search source photo"}
      </figcaption>
    </figure>
  );
}
function SearchCard({ search: s }: { search: SearchResult }) {
  const labels = {
    found: "Search results returned",
    test: "Sandbox test data · not live availability",
    unavailable: "No priced results returned",
    "not-connected": "Source not connected",
    "needs-details": "More details needed",
    error: "Search interrupted",
  };
  return (
    <article className="ai-search-card">
      <h4>{s.title}</h4>
      <p>{s.scope}</p>
      <span>{labels[s.status]}</span>
      <p>{s.note}</p>
      <small>Attempted {new Date(s.checkedAt).toLocaleString("en-IN")}</small>
      {s.offers.map((o, i) => (
        <div
          className={`ai-offer ${s.kind === "hotel" ? "ai-hotel-offer" : ""}`}
          key={i}
        >
          {s.kind === "hotel" && (
            <HotelOfferPhoto url={o.imageUrl} name={o.name} scope={s.scope} />
          )}
          <div>
            <strong>{o.name}</strong>
            <p>{o.basis}</p>
            <small>{o.taxes}</small>
          </div>
          <div>
            <strong>{inr(o.priceINR)}</strong>
            <a href={o.url} target="_blank" rel="noopener noreferrer">
              Review details ↗
            </a>
          </div>
        </div>
      ))}
    </article>
  );
}
export function AISavedPlans() {
  const t = useTravel(),
    router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  return (
    <>
      {t.saved.length > 0 && (
        <section className="ai-saved">
          <h2>Your AI itineraries.</h2>
          <div className="saved-list">
            {t.saved.map((s) => (
              <article key={s.id}>
                <div>
                  <h3>{s.itinerary?.title}</h3>
                  <p>
                    {s.itinerary?.days.length} days ·{" "}
                    {s.interview?.profile.dates || "Dates flexible"}
                  </p>
                  <span className="secondary">
                    Saved on this device · prices may have changed
                  </span>
                </div>
                <div className="saved-actions">
                  <button
                    className="button secondary-button"
                    disabled={Boolean(t.busy)}
                    onClick={() => {
                      t.openSaved(s);
                      router.push("/plan/?view=itinerary");
                    }}
                  >
                    Open trip <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setPending(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {pending && (
        <Modal title="Delete this saved trip?" onClose={() => setPending(null)}>
          <p>
            Your current conversation stays open. This removes the separate
            saved copy from this browser.
          </p>
          <button
            className="button"
            onClick={() => {
              t.deleteSaved(pending);
              setPending(null);
            }}
          >
            Delete saved copy
          </button>
          <button className="text-button" onClick={() => setPending(null)}>
            Keep trip
          </button>
        </Modal>
      )}
    </>
  );
}
function TravelChat() {
  const t = useTravel();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null),
    launcher = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    launcher.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <div className="travel-chat">
      <button
        ref={launcher}
        className="chat-launcher"
        onClick={() => setOpen(true)}
        aria-label="Ask about Japan — Open travel assistant"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MessageCircle size={21} />
        <span>Ask about Japan</span>
      </button>
      <dialog
        ref={ref}
        className="chat-dialog"
        aria-labelledby="chat-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="chat-head">
          <div>
            <h2 id="chat-title">Japan travel assistant</h2>
            <p>Japan, Your Way · powered by Groq</p>
          </div>
          <button
            className="icon-button"
            aria-label="Minimize chat"
            onClick={close}
          >
            <Minus size={19} />
          </button>
          <button
            className="icon-button"
            aria-label="Close chat"
            onClick={close}
          >
            <X size={19} />
          </button>
        </div>
        <div className="chat-context">
          <span>
            {t.session.itinerary
              ? `Trip context: ${t.session.itinerary.title}`
              : t.session.interview
                ? "Using your active trip preferences"
                : "A little guidance, wherever you are"}
          </span>
          <Link href="/plan/" onClick={close}>
            Open planner <ArrowUpRight size={14} />
          </Link>
        </div>
        <Transcript
          compact
          messages={t.session.chat}
          busy={t.busy === "chat"}
        />
        {t.error && t.errorAction === "chat" && (
          <div className="ai-error" role="alert">
            <p>{t.error}</p>
            {t.session.chat.at(-1)?.role === "user" && (
              <button
                className="text-button"
                disabled={Boolean(t.busy)}
                onClick={t.retry}
              >
                Retry chat
              </button>
            )}
          </div>
        )}
        <Composer
          compact
          label="Your Japan travel question"
          disabled={Boolean(t.busy) || !t.loaded}
          onSend={(text) => t.send("chat", text)}
        />
        <div className="chat-footer">
          <span>Conversation sent to Groq · saved on this device</span>
          <button
            className="text-button"
            disabled={Boolean(t.busy)}
            onClick={t.clearChat}
          >
            Clear chat
          </button>
        </div>
      </dialog>
    </div>
  );
}
