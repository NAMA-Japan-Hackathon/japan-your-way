"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Pause, Play, Sun } from "lucide-react";

// Only the landscape: skip the source's black opening and closing title card.
const START = 2;
const END = 32;
const POSTER = "/videos/fuji-lake-motosu-poster.webp";

export function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const wantsPlayback = useRef(false);
  const visible = useRef(true);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (wantsPlayback.current && visible.current && !document.hidden) {
        void video.play().catch(() => setPlaying(false));
      } else video.pause();
    };
    const applyPreference = () => {
      wantsPlayback.current = !preference.matches;
      if (preference.matches) video.pause();
      else {
        setEnabled(true);
        if (video.readyState >= 2) syncPlayback();
      }
    };
    applyPreference();
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (video.readyState >= 2) syncPlayback();
    });
    observer.observe(root);
    preference.addEventListener("change", applyPreference);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", applyPreference);
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video || failed) return;
    wantsPlayback.current = !wantsPlayback.current;
    if (!wantsPlayback.current) video.pause();
    else {
      setEnabled(true);
      if (video.readyState >= 2) {
        void video.play().catch(() => setPlaying(false));
      }
    }
  };

  return (
    <>
      <div
        ref={rootRef}
        className="hero-landscape hero-film"
        aria-hidden="true"
      >
        <img
          src={POSTER}
          width="1920"
          height="1080"
          alt=""
          fetchPriority="high"
        />
        <video
          ref={videoRef}
          className={ready && !failed ? "is-ready" : undefined}
          src={enabled ? "/videos/fuji-lake-motosu.mp4" : undefined}
          poster={POSTER}
          width="1920"
          height="1080"
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          tabIndex={-1}
          onLoadedMetadata={(event) => {
            event.currentTarget.currentTime = START;
          }}
          onSeeked={(event) => {
            setReady(true);
            if (wantsPlayback.current && visible.current && !document.hidden) {
              void event.currentTarget.play().catch(() => setPlaying(false));
            }
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (video.currentTime >= END && wantsPlayback.current) {
              video.currentTime = START;
            }
            setProgress(
              Math.max(
                0,
                Math.min(
                  100,
                  ((video.currentTime - START) / (END - START)) * 100,
                ),
              ),
            );
          }}
          onError={() => {
            wantsPlayback.current = false;
            setPlaying(false);
            setFailed(true);
          }}
        />
      </div>
      <div
        className="hero-film-controls"
        role="group"
        aria-label="Mount Fuji time-lapse controls"
      >
        <div className="hero-film-caption">
          <span>Lake Motosu, Mount Fuji</span>
          <span>Film by Yuga Kurita</span>
        </div>
        <div className="hero-film-transport">
          <button
            type="button"
            className="hero-film-toggle"
            aria-label={
              playing ? "Pause background video" : "Play background video"
            }
            onClick={togglePlayback}
            disabled={failed}
          >
            {playing ? (
              <Pause size={17} aria-hidden="true" />
            ) : (
              <Play size={17} aria-hidden="true" />
            )}
          </button>
          <Moon size={15} aria-hidden="true" />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={progress}
            aria-label="Explore night to sunrise"
            aria-valuetext={`${Math.round(progress)} percent from night to sunrise`}
            disabled={!ready || failed}
            onChange={(event) => {
              const video = videoRef.current;
              if (!video || !ready) return;
              wantsPlayback.current = false;
              video.pause();
              const value = Number(event.currentTarget.value);
              video.currentTime = START + (value / 100) * (END - START);
              setProgress(value);
            }}
          />
          <Sun size={17} aria-hidden="true" />
        </div>
        <span className="hero-film-hint">
          {failed
            ? "Still view · video unavailable"
            : "Move through the morning"}
        </span>
      </div>
    </>
  );
}
