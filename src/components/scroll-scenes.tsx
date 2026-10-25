"use client";
import { useEffect } from "react";
import { Kintsugi } from "./kintsugi";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "./shared";
import { ArrowDown } from "lucide-react";
import { HeroFilm } from "./hero-film";

type StageAPI = {
  scene: (root: Element, options: unknown) => { revert: () => void };
  ready: () => Promise<void>;
};
export function ScrollScenes() {
  useEffect(() => {
    let disposed = false;
    let script: HTMLScriptElement | undefined;
    let cleanup: (() => void) | undefined;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      Object.assign(window, { gsap, ScrollTrigger });
      const init = () => {
        if (disposed) return;
        document.documentElement.classList.add("js");
        const stage = (window as unknown as { Stage: StageAPI }).Stage;
        const sceneMedia = gsap.matchMedia();
        sceneMedia.add("(min-height: 601px)", () => {
          const instances: { revert: () => void }[] = [];
          const hero = document.querySelector('[data-scene="fuji-at-dusk"]');
          if (hero)
            instances.push(
              stage.scene(hero, {
                hold: 1,
                phone: "rest",
                scrub: true,
                beats: 2,
                build: (
                  tl: gsap.core.Timeline,
                  { q }: { q: (s: string) => Element[] },
                ) => {
                  tl.fromTo(
                    q(".hero-landscape"),
                    { scale: 1, yPercent: 0 },
                    { scale: 1.12, yPercent: -5, duration: 1 },
                    0,
                  )
                    .to(
                      q(".cinema-hero-copy"),
                      { y: -55, opacity: 0.72, duration: 1 },
                      0,
                    )
                    .to(
                      q(".hero-route"),
                      { y: -20, opacity: 0, duration: 0.55 },
                      0.25,
                    );
                },
              }),
            );
          const garden = document.querySelector(
            '[data-scene="garden-opening"]',
          );
          if (garden)
            instances.push(
              stage.scene(garden, {
                hold: 1,
                phone: { hold: 0.6 },
                scrub: true,
                beats: 2,
                build: (
                  tl: gsap.core.Timeline,
                  { q, phone }: { q: (s: string) => Element[]; phone: boolean },
                ) => {
                  tl.fromTo(
                    q(".garden-picture"),
                    {
                      clipPath: phone
                        ? "inset(37% 5% 8% 5%)"
                        : "inset(12% 5% 12% 48%)",
                    },
                    { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75 },
                    0,
                  )
                    .fromTo(
                      q(".garden-picture img"),
                      { scale: 1.12 },
                      { scale: 1, duration: 1 },
                      0,
                    )
                    .to(
                      q(".garden-intro"),
                      { autoAlpha: 0, y: -30, duration: 0.25 },
                      0.05,
                    )
                    .fromTo(
                      q(".garden-end"),
                      { autoAlpha: 0, y: 35 },
                      { autoAlpha: 1, y: 0, duration: 0.3 },
                      0.65,
                    );
                },
              }),
            );
          return () => instances.forEach((instance) => instance?.revert());
        });
        const railMedia = gsap.matchMedia();
        railMedia.add(
          "(min-width: 600px) and (prefers-reduced-motion: no-preference)",
          () => {
            const journey =
              document.querySelector<HTMLElement>(".regional-journey");
            const progress = journey?.querySelector<HTMLElement>(
              ".journey-progress-fill",
            );
            if (!journey || !progress) return;
            gsap.fromTo(
              progress,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: journey,
                  start: "top 85%",
                  end: "bottom 70%",
                  scrub: 0.3,
                },
              },
            );
          },
        );
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          document.querySelectorAll(".kintsugi-seam").forEach((seam) => {
            gsap.fromTo(
              seam.querySelectorAll(".gold-fill path"),
              { strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                stagger: 0.09,
                ease: "none",
                scrollTrigger: {
                  trigger: seam,
                  start: "top 90%",
                  end: "bottom 40%",
                  scrub: 0.35,
                },
              },
            );
          });
          document
            .querySelectorAll<HTMLElement>(".cinematic-home [data-enter]")
            .forEach((el, i) => {
              if (el.getBoundingClientRect().top < window.innerHeight * 0.93)
                return;
              const kind = el.dataset.enter;
              const movement =
                kind === "left"
                  ? { x: -26 }
                  : kind === "right"
                    ? { x: 26 }
                    : { y: kind === "card" ? 42 : 24 };
              gsap.from(el, {
                ...movement,
                opacity: 0,
                duration: kind === "row" ? 0.65 : 0.85,
                delay: kind === "card" ? (i % 3) * 0.07 : 0,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 93%", once: true },
              });
            });
          const journey =
            document.querySelector<HTMLElement>(".regional-journey");
          if (journey) {
            journey
              .querySelectorAll<HTMLElement>("[data-journey-card]")
              .forEach((card, index) => {
                if (
                  card.getBoundingClientRect().top <
                  window.innerHeight * 0.95
                )
                  return;
                const image = card.querySelector<HTMLElement>(
                  ".activity-image img",
                );
                const reveal = gsap.timeline({
                  scrollTrigger: {
                    trigger: card,
                    start: "top 88%",
                    once: true,
                  },
                  delay: window.innerWidth > 520 ? (index % 2) * 0.08 : 0,
                });
                reveal.from(card, {
                  y: 32,
                  opacity: 0.55,
                  duration: 0.7,
                  ease: "power3.out",
                });
                if (image)
                  reveal.from(
                    image,
                    {
                      scale: 1.07,
                      duration: 1.1,
                      ease: "power3.out",
                      onComplete: () =>
                        gsap.set(image, { clearProps: "transform" }),
                    },
                    0.04,
                  );
              });
          }
          document
            .querySelectorAll<HTMLElement>(".cinematic-home [data-drift]")
            .forEach((el) => {
              gsap.fromTo(
                el,
                { yPercent: -3, scale: 1.08 },
                {
                  yPercent: 3,
                  scale: 1.04,
                  ease: "none",
                  scrollTrigger: {
                    trigger: el.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
            });
        });
        stage.ready().then(() => {
          if (!disposed) ScrollTrigger.refresh();
        });
        const journey =
          document.querySelector<HTMLElement>(".regional-journey");
        let refreshFrame = 0;
        const observer = new ResizeObserver(() => {
          cancelAnimationFrame(refreshFrame);
          refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        if (journey) observer.observe(journey);
        cleanup = () => {
          observer.disconnect();
          cancelAnimationFrame(refreshFrame);
          railMedia.revert();
          mm.revert();
          sceneMedia.revert();
        };
      };
      script = document.createElement("script");
      script.src = "/scenes/stage.js";
      script.onload = init;
      script.onerror = () =>
        document
          .querySelectorAll(".cinematic-home .scene")
          .forEach((el) => el.classList.add("is-rest"));
      document.body.appendChild(script);
    })().catch(() =>
      document
        .querySelectorAll(".cinematic-home .scene")
        .forEach((el) => el.classList.add("is-rest")),
    );
    return () => {
      disposed = true;
      cleanup?.();
      script?.remove();
    };
  }, []);
  return null;
}
export function PhotoHero() {
  return (
    <section
      className="scene cinema-hero"
      data-scene="fuji-at-dusk"
      aria-label="Japan, your way"
    >
      <div className="scene-stage">
        <HeroFilm />
        <div className="hero-shade" />
        <Kintsugi right variant={2} position="low" />
        <div className="cinema-hero-copy">
          <h1>
            Japan,
            <br />
            <span>your way.</span>
          </h1>
          <p>
            A trip that fits your dates, your food needs,
            <br className="wide-break" /> and the unhurried way you love to
            travel.
          </p>
          <div className="cinema-actions">
            <Link href="/plan/" className="button">
              Plan my Japan <ArrowUpRight size={18} />
            </Link>
            <a href="#explore-japan" className="cinema-secondary">
              Explore all Japan <ArrowRight size={18} />
            </a>
          </div>
          <span className="hero-note">A little wonder. A clearer plan.</span>
        </div>
        <div className="hero-route">
          <span>
            Hokkaido <i /> Honshu <i /> Okinawa
          </span>
          <a href="#explore-japan" aria-label="Discover your rhythm — Explore all Japan">
            <span>Discover your rhythm</span> <ArrowDown size={17} />
          </a>
          <Link href="/metro/" aria-label="Rail atlas — Explore Japan by rail">
            Rail atlas <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
export function WindowScene() {
  return (
    <section
      className="scene cinema-garden"
      data-scene="garden-opening"
      aria-label="Room for the unexpected"
    >
      <div className="scene-stage">
        <div className="garden-picture">
          <img
            src="/images/garden.webp"
            width="1600"
            height="1000"
            alt="Raked sand and woodland in Kyoto’s Ginkaku-ji garden"
            loading="lazy"
          />
          <span />
        </div>
        <div className="garden-intro">
          <h2>
            Room for
            <br />
            the unexpected.
          </h2>
          <p>
            A quieter afternoon. An unplanned turn.
            <br />A day that feels like yours.
          </p>
        </div>
        <div className="garden-end">
          <h2>
            Keep the wonder.
            <br />
            Check the details.
          </h2>
          <p>Good planning leaves more space for being there.</p>
          <Link href="/plan/" className="text-link">
            Find your pace <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
