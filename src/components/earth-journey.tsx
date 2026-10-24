"use client";

import { useEffect, useRef, useState } from "react";

type Place = {
  name: string;
  kind: string;
  highlight: string;
  lat: number;
  lon: number;
  image: string;
  imageAlt: string;
  featured?: boolean;
};

const places: Place[] = [
  { name: "Sapporo", kind: "City · Hokkaido", highlight: "Wide parks, winter festivals and Hokkaido food.", lat: 43.0618, lon: 141.3545, image: "/images/regions/hokkaido.jpg", imageAlt: "Odori Park in Sapporo" },
  { name: "Matsushima Bay", kind: "Coast · Tohoku", highlight: "Pine-clad islands and calm views from Miyagi’s coast.", lat: 38.371, lon: 141.069, image: "/images/regions/tohoku.jpg", imageAlt: "Matsushima Bay in Miyagi" },
  { name: "Tokyo", kind: "Capital · Kanto", highlight: "Asakusa lanes, modern neighborhoods and late-night light.", lat: 35.6762, lon: 139.6503, image: "/images/tokyo.webp", imageAlt: "Nakamise shopping street in Tokyo", featured: true },
  { name: "Mount Fuji", kind: "Mountain · Tokai", highlight: "Japan’s iconic peak above lakes and mountain towns.", lat: 35.3606, lon: 138.7274, image: "/images/fuji-night-1920.webp", imageAlt: "Mount Fuji and Chureito Pagoda", featured: true },
  { name: "Kanazawa", kind: "City · Hokuriku", highlight: "Kenrokuen garden, craft traditions and old streets.", lat: 36.5613, lon: 136.6562, image: "/images/regions/hokuriku-shinetsu.jpg", imageAlt: "Kenrokuen garden in Kanazawa" },
  { name: "Kyoto", kind: "City · Kansai", highlight: "Temple paths, Higashiyama lanes and centuries of craft.", lat: 35.0116, lon: 135.7681, image: "/images/kyoto.webp", imageAlt: "Higashiyama street in Kyoto", featured: true },
  { name: "Osaka", kind: "City · Kansai", highlight: "Canal-side neon, street food and lively evenings.", lat: 34.6937, lon: 135.5023, image: "/images/osaka.webp", imageAlt: "Dotonbori district in Osaka" },
  { name: "Miyajima", kind: "Island · Chugoku", highlight: "Itsukushima Shrine’s sea-facing torii and forest trails.", lat: 34.296, lon: 132.3193, image: "/images/regions/chugoku.jpg", imageAlt: "Itsukushima torii on Miyajima", featured: true },
  { name: "Ritsurin Garden", kind: "Garden · Shikoku", highlight: "A historic landscape garden of ponds and borrowed scenery.", lat: 34.3297, lon: 134.0433, image: "/images/regions/shikoku.jpg", imageAlt: "Ritsurin Garden in Takamatsu" },
  { name: "Mount Aso", kind: "Volcano · Kyushu", highlight: "Volcanic grasslands and a vast central caldera.", lat: 32.8844, lon: 131.1044, image: "/images/regions/kyushu.jpg", imageAlt: "Landscape around Mount Aso" },
  { name: "Ishigaki", kind: "Island · Okinawa", highlight: "Clear water and the sheltered colors of Kabira Bay.", lat: 24.3448, lon: 124.1572, image: "/images/regions/okinawa.jpg", imageAlt: "Kabira Bay on Ishigaki", featured: true },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const ease = (value: number) => value * value * (3 - 2 * value);

export function EarthJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [activePlace, setActivePlace] = useState<Place | null>(null);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCanAnimate(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!canAnimate) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const mount = canvasRef.current;
    if (!section || !stage || !mount) return;

    let disposed = false;
    let observer: IntersectionObserver | undefined;
    let destroyScene: (() => void) | undefined;

    const initialize = async () => {
      if (destroyScene || disposed) return;
      try {
        const [THREE, { gsap }, { ScrollTrigger }] = await Promise.all([
          import("three"), import("gsap"), import("gsap/ScrollTrigger"),
        ]);
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);
        let width = stage.clientWidth;
        let height = stage.clientHeight;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(width, height, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute("aria-hidden", "true");
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(43, width / height, 0.1, 100);
        camera.position.set(0, 0, 5.2);
        const earth = new THREE.Group();
        scene.add(earth);
        const geometry = new THREE.SphereGeometry(1.62, 72, 48);
        const texture = await new THREE.TextureLoader().loadAsync("/images/globe/earth-surface.jpg");
        if (disposed) {
          geometry.dispose(); texture.dispose(); renderer.dispose(); renderer.domElement.remove();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
        const material = new THREE.MeshPhongMaterial({ map: texture, shininess: 5, specular: new THREE.Color("#253443") });
        earth.add(new THREE.Mesh(geometry, material));
        const glowGeometry = new THREE.SphereGeometry(1.66, 48, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({ color: "#7ba5be", side: THREE.BackSide, transparent: true, opacity: 0.12, depthWrite: false });
        earth.add(new THREE.Mesh(glowGeometry, glowMaterial));
        scene.add(new THREE.AmbientLight("#8fa7bd", 1.65));
        const sunlight = new THREE.DirectionalLight("#fff4db", 2.7);
        sunlight.position.set(-2.5, 1.5, 5);
        scene.add(sunlight);

        const markerButtons = [...stage.querySelectorAll<HTMLButtonElement>("[data-earth-marker]")];
        const intro = stage.querySelector<HTMLElement>(".earth-intro");
        const arrival = stage.querySelector<HTMLElement>(".earth-arrival");
        const placeRail = stage.querySelector<HTMLElement>(".earth-place-rail");
        const progressLine = stage.querySelector<HTMLElement>(".earth-progress-fill");
        const vector = new THREE.Vector3();
        const normal = new THREE.Vector3();
        const cameraVector = new THREE.Vector3();
        const latitudeLongitudePoint = (lat: number, lon: number) => {
          const latitude = THREE.MathUtils.degToRad(lat);
          const longitude = THREE.MathUtils.degToRad(lon);
          return new THREE.Vector3(
            1.635 * Math.cos(latitude) * Math.cos(longitude),
            1.635 * Math.sin(latitude),
            -1.635 * Math.cos(latitude) * Math.sin(longitude),
          );
        };
        const points = places.map((place) => latitudeLongitudePoint(place.lat, place.lon));
        let currentProgress = -1;
        let markersWereVisible = false;

        const draw = (progress: number) => {
          currentProgress = clamp(progress, 0, 1);
          const turn = ease(clamp(currentProgress / 0.7, 0, 1));
          const zoom = ease(clamp((currentProgress - 0.48) / 0.42, 0, 1));
          const reveal = ease(clamp((currentProgress - 0.69) / 0.18, 0, 1));
          const markersVisible = reveal > 0.7;
          if (markersWereVisible && !markersVisible) setActivePlace(null);
          markersWereVisible = markersVisible;
          // Travel east across Europe and Asia, then stop with Japan facing forward.
          earth.rotation.y = THREE.MathUtils.lerp(
            THREE.MathUtils.degToRad(-60),
            THREE.MathUtils.degToRad(-227.4),
            turn,
          );
          // Tilt north toward the viewer so Japan, around 35° N, becomes the
          // visual center rather than remaining above an equator-centered view.
          earth.rotation.x = THREE.MathUtils.degToRad(35.5) * zoom;
          earth.position.set(0, 0, 0);
          camera.position.z = THREE.MathUtils.lerp(5.2, width < 700 ? 3.5 : 3.25, zoom);
          camera.updateProjectionMatrix();
          earth.updateMatrixWorld(true);
          if (intro) {
            intro.style.opacity = String(1 - ease(clamp((currentProgress - 0.32) / 0.2, 0, 1)));
            intro.style.transform = `translateY(${-22 * turn}px)`;
          }
          if (arrival) {
            arrival.style.opacity = String(reveal);
            arrival.style.transform = `translateY(${24 * (1 - reveal)}px)`;
          }
          if (placeRail) {
            placeRail.style.opacity = String(reveal);
            placeRail.style.pointerEvents = markersVisible ? "auto" : "none";
            placeRail.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
              button.tabIndex = markersVisible ? 0 : -1;
            });
          }
          if (progressLine) progressLine.style.transform = `scaleX(${currentProgress})`;

          markerButtons.forEach((button, index) => {
            vector.copy(points[index]).applyMatrix4(earth.matrixWorld);
            normal.copy(points[index]).normalize().transformDirection(earth.matrixWorld);
            cameraVector.copy(camera.position).sub(vector).normalize();
            const isFacing = normal.dot(cameraVector) > 0.22;
            vector.project(camera);
            const x = (vector.x * 0.5 + 0.5) * width;
            const y = (-vector.y * 0.5 + 0.5) * height;
            const visible = markersVisible && isFacing && x > 25 && x < width - 25 && y > 25 && y < height - 25;
            button.style.left = `${x}px`;
            button.style.top = `${y}px`;
            button.style.opacity = visible ? String(reveal) : "0";
            button.style.pointerEvents = visible ? "auto" : "none";
            button.tabIndex = visible ? 0 : -1;
          });
          renderer.render(scene, camera);
        };

        const resize = () => {
          const nextWidth = stage.clientWidth;
          const nextHeight = stage.clientHeight;
          width = nextWidth;
          height = nextHeight;
          renderer.setSize(nextWidth, nextHeight, false);
          camera.aspect = nextWidth / nextHeight;
          camera.updateProjectionMatrix();
          draw(currentProgress < 0 ? 0 : currentProgress);
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(stage);
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => draw(self.progress),
          onRefresh: (self) => draw(self.progress),
        });
        draw(trigger.progress);
        section.dataset.earthReady = "true";
        destroyScene = () => {
          resizeObserver.disconnect();
          trigger.kill();
          geometry.dispose();
          glowGeometry.dispose();
          material.dispose();
          glowMaterial.dispose();
          texture.dispose();
          renderer.dispose();
          renderer.domElement.remove();
          delete section.dataset.earthReady;
        };
      } catch {
        section.dataset.earthFallback = "true";
      }
    };

    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer?.disconnect();
        void initialize();
      }
    }, { rootMargin: "100% 0px" });
    observer.observe(section);
    return () => {
      disposed = true;
      observer?.disconnect();
      destroyScene?.();
    };
  }, [canAnimate]);

  const positionTooltip = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    const tooltip = tooltipRef.current;
    if (!stage || !tooltip) return;
    const bounds = stage.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    tooltip.style.left = `${clamp(x, 18, bounds.width - 18)}px`;
    tooltip.style.top = `${clamp(y, 145, bounds.height - 20)}px`;
    tooltip.dataset.align = x > bounds.width * 0.63 ? "left" : "right";
  };

  return (
    <section className="earth-journey" id="earth-journey" ref={sectionRef} aria-label="Journey to Japan on a globe">
      <div className="earth-stage" ref={stageRef}>
        <div className="earth-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="earth-grain" aria-hidden="true" />
        <div className="earth-topline"><span>THE WORLD, THEN JAPAN</span><span>35° N · 137° E</span></div>
        <div className="earth-intro">
          <span className="earth-eyebrow">A little further, a little closer</span>
          <h2>Somewhere in the world,<br /><em>your Japan begins.</em></h2>
          <p>Scroll to turn the world and discover where the journey leads.</p>
        </div>
        <div className="earth-arrival">
          <span className="earth-eyebrow">You have arrived</span>
          <h2>Japan<span className="earth-period">.</span></h2>
          <p>Hover or tap a point to find your first stop.</p>
          <a href="#explore-japan">Explore all of Japan <span aria-hidden="true">↗</span></a>
        </div>
        <div className="earth-markers" aria-label="Places in Japan">
          {places.map((place, index) => (
            <button
              className={`earth-marker${place.featured ? " earth-marker-featured" : ""}`}
              type="button"
              key={place.name}
              data-earth-marker={index}
              tabIndex={-1}
              aria-label={`${place.name}: ${place.highlight}`}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") { setActivePlace(place); positionTooltip(event.clientX, event.clientY); } }}
              onPointerMove={(event) => { if (event.pointerType !== "touch") positionTooltip(event.clientX, event.clientY); }}
              onPointerLeave={(event) => { if (event.pointerType !== "touch") setActivePlace(null); }}
              onFocus={(event) => { setActivePlace(place); const box = event.currentTarget.getBoundingClientRect(); positionTooltip(box.left + box.width / 2, box.top); }}
              onBlur={() => setActivePlace(null)}
              onClick={(event) => { setActivePlace(place); const box = event.currentTarget.getBoundingClientRect(); positionTooltip(box.left + box.width / 2, box.top); }}
            ><span className="earth-marker-dot" /><span className="earth-marker-label">{place.name}</span></button>
          ))}
        </div>
        <div className={`earth-tooltip${activePlace ? " is-visible" : ""}`} ref={tooltipRef} aria-hidden="true">
          {activePlace && <><img src={activePlace.image} alt="" /><div className="earth-tooltip-body"><span>{activePlace.kind}</span><strong>{activePlace.name}</strong><p>{activePlace.highlight}</p></div></>}
        </div>
        <div className="earth-place-rail" aria-label="Explore places on the globe">
          <span className="earth-place-rail-label">Places on the map</span>
          <div className="earth-place-rail-scroll">
            {places.map((place) => <button
              type="button"
              key={place.name}
              tabIndex={-1}
              aria-label={`${place.name}: ${place.highlight}`}
              aria-pressed={activePlace?.name === place.name}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") { setActivePlace(place); positionTooltip(event.clientX, event.clientY); } }}
              onPointerMove={(event) => { if (event.pointerType !== "touch") positionTooltip(event.clientX, event.clientY); }}
              onPointerLeave={(event) => { if (event.pointerType !== "touch") setActivePlace(null); }}
              onFocus={(event) => { setActivePlace(place); const box = event.currentTarget.getBoundingClientRect(); positionTooltip(box.left + box.width / 2, box.top); }}
              onBlur={() => setActivePlace(null)}
              onClick={(event) => { setActivePlace(place); const box = event.currentTarget.getBoundingClientRect(); positionTooltip(box.left + box.width / 2, box.top); }}
            >{place.name}</button>)}
          </div>
        </div>
        <div className="earth-bottomline"><span>SCROLL TO EXPLORE</span><span className="earth-progress"><i className="earth-progress-fill" /></span><span>01 / 02</span></div>
        <a className="earth-imagery-credit" href="https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets" target="_blank" rel="noreferrer">Earth imagery: Three.js examples ↗</a>
      </div>
      <div className="earth-static" aria-label="Featured places in Japan">
        <div><span className="earth-eyebrow">Explore the islands</span><h2>Japan, from above.</h2><p>Choose a place to begin, then explore all 47 prefectures below.</p></div>
        <div className="earth-static-grid">{places.map((place) => <article key={place.name}><img src={place.image} alt={place.imageAlt} loading="lazy" /><span>{place.kind}</span><h3>{place.name}</h3><p>{place.highlight}</p></article>)}</div>
      </div>
    </section>
  );
}
