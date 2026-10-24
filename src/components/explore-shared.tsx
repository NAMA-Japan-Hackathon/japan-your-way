"use client";
import { useEffect, useRef, useState } from "react";
import { Kintsugi } from "./kintsugi";
import type { ImageRef, Source } from "@/lib/explore";
export function ExploreMotion() {
  useEffect(() => {
    let disposed = false;
    let revert: (() => void) | undefined;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const entryAnimations: { revert: () => void }[] = [];
        const entered = new WeakSet<Element>();
        const animateEntries = () => {
          document
            .querySelectorAll<HTMLElement>(".explore-page [data-enter]")
            .forEach((el, i) => {
              if (el.matches(".destination-story")) return;
              if (entered.has(el)) return;
              entered.add(el);
              if (el.getBoundingClientRect().top < innerHeight * 0.95) return;
              entryAnimations.push(
                gsap.from(el, {
                  y: 24,
                  opacity: 0,
                  duration: 0.5,
                  delay: (i % 3) * 0.06,
                  ease: "power2.out",
                  scrollTrigger: { trigger: el, start: "top 94%", once: true },
                }),
              );
            });
        };
        animateEntries();
        document
          .querySelectorAll<HTMLElement>(".destination-story")
          .forEach((story, index) => {
            if (story.getBoundingClientRect().top < innerHeight * 0.95) return;
            const picture = story.querySelector<HTMLElement>(
              ".destination-story-image",
            );
            const copy = story.querySelector<HTMLElement>(
              ".destination-story-copy",
            );
            const reveal = gsap.timeline({
              scrollTrigger: { trigger: story, start: "top 84%", once: true },
            });
            if (picture)
              reveal.from(picture, {
                x: innerWidth > 760 ? (index % 2 ? 28 : -28) : 0,
                y: innerWidth > 760 ? 0 : 24,
                opacity: 0.65,
                duration: 0.85,
                ease: "power3.out",
              });
            if (copy)
              reveal.from(
                copy,
                {
                  y: 24,
                  opacity: 0.65,
                  duration: 0.7,
                  ease: "power3.out",
                },
                0.14,
              );
          });
        document
          .querySelectorAll<HTMLElement>(".region-card")
          .forEach((card) => {
            if (card.getBoundingClientRect().top < innerHeight * 0.95) return;
            const image = card.querySelector<HTMLElement>(
              ".region-card-photo img",
            );
            if (!image) return;
            gsap.from(image, {
              scale: 1.07,
              duration: 1.05,
              ease: "power3.out",
              onComplete: () => gsap.set(image, { clearProps: "transform" }),
              scrollTrigger: { trigger: card, start: "top 88%", once: true },
            });
          });
        const observer = new MutationObserver(animateEntries);
        const root = document.querySelector(".explore-page main");
        if (root) observer.observe(root, { childList: true, subtree: true });
        document
          .querySelectorAll(".explore-page [data-photo-drift]")
          .forEach((el) =>
            gsap.to(el, {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }),
          );
        document.querySelectorAll(".explore-page .gold-fill").forEach((el) =>
          gsap.fromTo(
            el.querySelectorAll("path"),
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              stagger: 0.05,
              scrollTrigger: {
                trigger: el.closest("svg"),
                start: "top 90%",
                end: "bottom 40%",
                scrub: 0.3,
              },
            },
          ),
        );
        document
          .querySelectorAll<SVGPathElement>(".explore-page [data-line-draw]")
          .forEach((el) => {
            const len = el.getTotalLength();
            gsap.fromTo(
              el,
              { strokeDasharray: len, strokeDashoffset: len },
              {
                strokeDashoffset: 0,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                  gsap.set(el, {
                    clearProps: "strokeDasharray,strokeDashoffset",
                  });
                },
                scrollTrigger: {
                  trigger: el.closest(".metro-stage"),
                  start: "top 95%",
                  once: true,
                },
              },
            );
          });
        return () => {
          observer.disconnect();
          entryAnimations.forEach((t) => t.revert());
        };
      });
      revert = () => mm.revert();
    })().catch(() => {});
    return () => {
      disposed = true;
      revert?.();
    };
  }, []);
  return null;
}
export function ExploreHero({ metro = false }: { metro?: boolean }) {
  return (
    <section className={`explore-hero ${metro ? "metro-intro" : ""}`}>
      <div className="explore-hero-picture">
        <img
          src={metro ? "/images/fuji-night-1920.webp" : "/images/osaka.webp"}
          alt={
            metro
              ? "Mount Fuji and Chureito Pagoda at dusk"
              : "Dotonbori’s illuminated canal in Osaka"
          }
          data-photo-drift
          fetchPriority="high"
        />
      </div>
      <div className="explore-hero-copy" data-enter>
        <h1>{metro ? "Japan, by rail." : "Good places.\nYour Japan."}</h1>
        <p>
          {metro
            ? "Explore Japan’s railways, from Hokkaido to Okinawa."
            : "Food worth a detour. Shopping worth an afternoon. The details you need before you go."}
        </p>
      </div>
      <Kintsugi right variant={1} />
    </section>
  );
}
export function PlacePhoto({
  image,
  name,
}: {
  image?: ImageRef;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image?.src]);
  const fallback = image?.fallback ?? {
    src: "/images/tokyo.webp",
    alt: "Shops along Nakamise in Asakusa, Tokyo",
    label: "Tokyo area · illustrative photograph",
  };
  const source = image && !failed ? image : fallback;
  const label = image && !failed ? image.contextLabel : fallback.label;
  return (
    <div className="place-photo" style={{ position: "relative" }}>
      <img
        src={source.src}
        alt={source.alt || `Area photograph for ${name}`}
        loading="lazy"
        onError={failed ? undefined : () => setFailed(true)}
        srcSet={
          image?.responsive && !failed
            ? `${image.src.replace("-1280", "-640")} 640w, ${image.src} 1280w, ${image.src.replace("-1280", "-1920")} 1920w`
            : undefined
        }
        sizes="(max-width:700px) 100vw, (max-width:1100px) 50vw, 33vw"
      />
      {label && (
        <small
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            right: 10,
            width: "fit-content",
            maxWidth: "calc(100% - 20px)",
            background: "rgba(18,18,18,.82)",
            color: "#f7f3eb",
            padding: "5px 9px",
            fontSize: 11,
            lineHeight: 1.4,
            borderRadius: 3,
          }}
        >
          {label}
        </small>
      )}
    </div>
  );
}
export function Sources({
  sources,
  checkedOn,
}: {
  sources: Source[];
  checkedOn: string;
}) {
  return (
    <section className="source-list">
      <h3>Sources & freshness</h3>
      <p>
        Checked {checkedOn}. A source review is not a visit or a guarantee of
        current availability.
      </p>
      <ul>
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
export function usePageQuery<T>(
  initial: T,
  read: (q: string) => T,
  write: (v: T) => string,
) {
  const [value, setValue] = useState(initial);
  const mounted = useRef(false);
  useEffect(() => {
    setValue(read(location.search));
    mounted.current = true;
    const pop = () => setValue(read(location.search));
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, [read]);
  const update = (next: T, historyEntry = false) => {
    setValue(next);
    if (mounted.current) {
      const q = write(next);
      window.history[historyEntry ? "pushState" : "replaceState"](
        null,
        "",
        `${location.pathname}${q ? "?" + q : ""}`,
      );
    }
  };
  return [value, update] as const;
}
