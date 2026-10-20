"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "./shared";
import { ArrowDown, Mountain } from "lucide-react";
import { SampleDay } from "./home";
// Both scenes use the skill's shared stage: native scroll, matchMedia, and a readable rest state.
export function ScrollScenes() {
  useEffect(() => {
    let disposed = false;
    let stageScript: HTMLScriptElement | undefined;
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        if (disposed) return;
        Object.assign(window, { gsap, ScrollTrigger });
        document.documentElement.classList.add("js");
        const init = () => {
          if (disposed) return;
          const w = window as unknown as {
            Stage: {
              scene: (root: Element, o: unknown) => { revert: () => void };
              ready: () => Promise<void>;
              scenes: { revert: () => void }[];
            };
            Scenes: Record<string, unknown>;
          };
          const instances: { revert: () => void }[] = [];
          const hero = document.querySelector(
            '[data-scene="japan-silhouette"]',
          );
          if (hero)
            instances.push(
              w.Stage.scene(hero, {
                hold: 1.25,
                phone: { hold: 0.8 },
                scrub: true,
                beats: 3,
                build: (
                  tl: gsap.core.Timeline,
                  { q, phone }: { q: (s: string) => Element[]; phone: boolean },
                ) => {
                  tl.fromTo(
                    q(".moon-disc"),
                    { y: 0 },
                    { y: -90, duration: 1 },
                    0,
                  )
                    .fromTo(
                      q(".mountain-back"),
                      { y: 0 },
                      { y: -45, scale: 1.04, duration: 1 },
                      0,
                    )
                    .fromTo(
                      q(".mountain-front"),
                      { y: 0 },
                      { y: -110, scale: 1.13, duration: 1 },
                      0,
                    )
                    .fromTo(
                      q(".pagoda-layer"),
                      { y: 0, scale: 1 },
                      { y: 90, scale: phone ? 1.2 : 1.45, duration: 1 },
                      0,
                    )
                    .fromTo(
                      q(".foreground-layer"),
                      { y: 0 },
                      { y: 150, scale: 1.25, duration: 1 },
                      0,
                    )
                    .to(
                      q(".opening-content"),
                      { y: -70, autoAlpha: 0, duration: 0.35 },
                      0.08,
                    )
                    .fromTo(
                      q(".scene-followup"),
                      { y: 90, autoAlpha: 0 },
                      { y: 0, autoAlpha: 1, duration: 0.34 },
                      0.46,
                    )
                    .to(
                      q(".silhouette-art"),
                      { opacity: 0.28, duration: 0.4 },
                      0.4,
                    );
                },
              }),
            );
          const windowRoot = document.querySelector(
            '[data-scene="japan-window"]',
          );
          if (windowRoot)
            instances.push(
              w.Stage.scene(windowRoot, {
                hold: 1.05,
                phone: { hold: 0.65 },
                scrub: true,
                beats: 2,
                build: (
                  tl: gsap.core.Timeline,
                  { q, phone }: { q: (s: string) => Element[]; phone: boolean },
                ) => {
                  tl.fromTo(
                    q(".window-picture"),
                    {
                      clipPath: phone
                        ? "inset(33% 6% 12% 6%)"
                        : "inset(15% 4% 15% 46%)",
                      scale: 1,
                    },
                    {
                      clipPath: "inset(0% 0% 0% 0%)",
                      scale: 1.025,
                      duration: 0.8,
                    },
                    0,
                  )
                    .to(
                      q(".window-intro"),
                      { autoAlpha: 0, y: -35, duration: 0.25 },
                      0.05,
                    )
                    .fromTo(
                      q(".window-end"),
                      { autoAlpha: 0, y: 30 },
                      { autoAlpha: 1, y: 0, duration: 0.35 },
                      0.55,
                    );
                },
              }),
            );
          w.Stage.ready();
          cleanup = () => instances.forEach((i) => i?.revert());
        };
        stageScript = document.createElement("script");
        stageScript.src = "/scenes/stage.js";
        stageScript.onload = init;
        document.body.appendChild(stageScript);
      } catch {
        document
          .querySelectorAll(".scene")
          .forEach((el) => el.classList.add("is-rest"));
      }
    })();
    return () => {
      disposed = true;
      cleanup?.();
      stageScript?.remove();
    };
  }, []);
  return null;
}
function Pagoda() {
  return (
    <g className="pagoda-layer" fill="#070808">
      <path d="M1165 930L1180 580H1290L1305 930Z" />
      <path d="M1142 920H1329V944H1142Z" />
      <path d="M1176 602H1294V623H1176ZM1170 671H1301V691H1170ZM1163 747H1308V768H1163ZM1157 830H1315V850H1157Z" />
      <path d="M1229 349H1239V463H1229Z" />
      <path d="M1220 384H1248V390H1220ZM1220 400H1248V406H1220ZM1219 418H1249V424H1219Z" />
      <circle cx="1234" cy="355" r="6" />
      <path d="M1234 443C1220 470 1184 489 1137 495L1125 481Q1150 518 1234 515Q1314 518 1344 481L1332 495C1285 489 1249 470 1234 443Z" />
      <path d="M1234 520C1205 549 1160 563 1108 565L1092 548Q1113 590 1234 584Q1355 591 1376 548L1360 565C1308 563 1263 549 1234 520Z" />
      <path d="M1234 591C1192 624 1131 637 1084 639L1068 620Q1089 667 1234 659Q1379 668 1401 620L1384 639C1337 637 1276 624 1234 591Z" />
      <path d="M1234 666C1184 706 1119 717 1060 721L1040 700Q1068 751 1234 742Q1400 752 1427 700L1407 721C1349 717 1284 706 1234 666Z" />
      <path d="M1234 750C1178 786 1108 807 1034 811L1013 788Q1042 843 1234 831Q1425 844 1455 788L1434 811C1360 807 1290 786 1234 750Z" />
      <path d="M1190 494H1278V570H1190ZM1183 574H1285V645H1183ZM1175 651H1293V729H1175ZM1166 738H1302V818H1166Z" />
      <g fill="#444942">
        <path d="M1210 535H1221V558H1210ZM1247 535H1258V558H1247ZM1207 609H1220V632H1207ZM1248 609H1261V632H1248ZM1202 687H1218V713H1202ZM1250 687H1266V713H1250ZM1197 770H1215V798H1197ZM1253 770H1271V798H1253Z" />
      </g>
      <path d="M1182 852H1193V919H1182ZM1277 852H1288V919H1277Z" />
    </g>
  );
}
export function SilhouetteHero() {
  return (
    <section
      className="scene silhouette-scene"
      data-scene="japan-silhouette"
      aria-label="Japan, your way: from wonder to a workable day"
    >
      <div className="scene-stage">
        <svg
          className="silhouette-art"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="An original illustration of a Japanese pagoda silhouetted against a moon and mountain landscape"
        >
          <g className="moon-disc">
            <circle cx="1180" cy="250" r="106" fill="#d5d7ca" />
          </g>
          <g className="mountain-back">
            <path
              d="M340 904L636 678L739 730L1040 348L1082 325L1337 699L1453 635L1700 830V1040H300Z"
              fill="#252b28"
            />
            <path
              d="M931 486L1040 348L1082 325L1180 469L1111 438L1074 454L1042 421L1000 470L976 457Z"
              fill="#6b736a"
            />
            <path
              d="M970 489L1050 359L1082 325L1045 456L1031 447Z"
              fill="#92998a"
            />
            <path
              d="M530 1000L743 754L888 855L1051 632L1195 751L1332 658L1600 869V1000Z"
              fill="#1d2320"
            />
          </g>
          <g className="mountain-front">
            <path
              d="M0 1000V934Q178 882 307 910Q466 720 629 843Q741 884 820 773Q968 745 1063 826Q1163 901 1320 860L1600 833V1030Z"
              fill="#111613"
            />
            <path
              d="M450 1000L739 842L857 878L991 806L1128 900L1400 927V1030Z"
              fill="#0b100d"
            />
          </g>
          <Pagoda />
          <g className="foreground-layer" fill="#050706">
            <path d="M0 1000V956L187 937L346 970L522 945L731 973L947 939L1179 959L1399 925L1600 953V1020Z" />
            <path d="M1589 1000L1535 685L1490 535L1451 332L1459 320L1506 518L1554 668L1600 804Z" />
            <path d="M1490 530L1380 439L1285 420L1281 410L1399 429L1501 509Z" />
            <path d="M1481 481L1520 388L1516 285L1526 283L1535 399L1493 514Z" />
            <path d="M1531 671L1432 615L1353 632L1351 623L1440 601L1545 649Z" />
            <path d="M1390 436L1374 373L1320 340L1324 331L1388 366L1405 442Z" />
            <path d="M1455 351L1406 307L1375 233L1384 230L1420 302L1460 333Z" />
            <path d="M1520 396L1570 350L1600 279V318L1580 367L1534 418Z" />
            <g fill="#111712">
              <ellipse
                cx="1405"
                cy="312"
                rx="45"
                ry="12"
                transform="rotate(18 1405 312)"
              />
              <ellipse
                cx="1370"
                cy="374"
                rx="50"
                ry="13"
                transform="rotate(-10 1370 374)"
              />
              <ellipse cx="1300" cy="420" rx="47" ry="13" />
              <ellipse
                cx="1454"
                cy="463"
                rx="47"
                ry="14"
                transform="rotate(-8 1454 463)"
              />
              <ellipse
                cx="1518"
                cy="308"
                rx="43"
                ry="12"
                transform="rotate(25 1518 308)"
              />
              <ellipse
                cx="1365"
                cy="627"
                rx="52"
                ry="12"
                transform="rotate(-13 1365 627)"
              />
              <ellipse
                cx="1572"
                cy="359"
                rx="48"
                ry="12"
                transform="rotate(-25 1572 359)"
              />
            </g>
          </g>
        </svg>
        <div className="opening-content">
          <div className="opening-copy">
            <h1>
              Japan,
              <br />
              your way.
            </h1>
            <p>
              A trip that fits your dates, your food needs, and the way you like
              to travel.
            </p>
            <div className="hero-actions">
              <Link href="/plan/" className="button">
                Plan my Japan <ArrowUpRight size={19} />
              </Link>
              <Link href="/trips/" className="text-link">
                Explore trips <ArrowRight size={17} />
              </Link>
            </div>
            <p className="opening-note">A little wonder. A clearer plan.</p>
          </div>
          <div className="opening-bottom">
            <span>
              Tokyo <i /> Kyoto <i /> Osaka
            </span>
            <a href="#trips" aria-label="Explore sample routes">
              <ArrowDown size={19} />
            </a>
            <span>For the way you travel</span>
          </div>
        </div>
        <div className="scene-followup">
          <div>
            <h2>
              A little wonder.
              <br />A clearer plan.
            </h2>
            <p>
              The places are just the beginning. See how meals, journeys, and
              time to pause fit into your day.
            </p>
            <Link href="/plan/" className="text-link">
              Make it yours <ArrowUpRight size={18} />
            </Link>
          </div>
          <SampleDay />
        </div>
      </div>
    </section>
  );
}
export function WindowScene() {
  return (
    <section
      className="scene window-scene"
      data-scene="japan-window"
      aria-label="Keep the wonder, check the details"
    >
      <div className="scene-stage">
        <div className="window-picture">
          <img
            src="/images/garden.webp"
            alt="Raked sand and green woodland at Kyoto’s Ginkaku-ji garden"
            width="1600"
            height="1000"
          />
          <span className="photo-scrim" />
        </div>
        <div className="window-intro">
          <h2>
            Room for
            <br />
            the unexpected.
          </h2>
          <p>
            A quieter afternoon. An unplanned turn. A day that feels like yours.
          </p>
          <Link href="/plan/" className="text-link">
            Find your pace <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="window-end">
          <h2>
            Keep the wonder.
            <br />
            Check the details.
          </h2>
          <p>Good planning leaves more space for being there.</p>
        </div>
      </div>
    </section>
  );
}
