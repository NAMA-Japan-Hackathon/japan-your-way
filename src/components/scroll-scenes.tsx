"use client";
import { useEffect } from "react";
import { Kintsugi } from "./kintsugi";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "./shared";
import { ArrowDown } from "lucide-react";

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
        const instances: { revert: () => void }[] = [];
        const hero = document.querySelector('[data-scene="fuji-at-dusk"]');
        if (hero)
          instances.push(
            stage.scene(hero, {
              hold: 1,
              phone: { hold: 0.45 },
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
                    { y: -55, opacity: 0.48, duration: 1 },
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
        const garden = document.querySelector('[data-scene="garden-opening"]');
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
        cleanup = () => {
          mm.revert();
          instances.forEach((i) => i?.revert());
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
        <img
          className="hero-landscape"
          src="/images/fuji-night-3840.webp"
          srcSet="/images/fuji-night-960.webp 960w, /images/fuji-night-1920.webp 1920w, /images/fuji-night-3840.webp 3840w"
          sizes="(max-aspect-ratio: 8/5) 165vh, 100vw"
          width="3840"
          height="2371"
          alt="Mount Fuji and the illuminated Chureito Pagoda at night in Fujiyoshida"
          fetchPriority="high"
        />
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
            <a href="#itinerary" className="cinema-secondary">
              Explore a sample day <ArrowRight size={18} />
            </a>
          </div>
          <span className="hero-note">A little wonder. A clearer plan.</span>
        </div>
        <div className="hero-route">
          <span>
            Tokyo <i /> Kyoto <i /> Osaka
          </span>
          <a href="#itinerary" aria-label="Discover a sample day">
            <span>Discover your rhythm</span> <ArrowDown size={17} />
          </a>
          <span>For the way you travel</span>
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
