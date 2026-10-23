"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Menu,
  X,
  Bookmark,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Fit } from "@/lib/planner";
export {
  ArrowUpRight,
  Check,
  ChevronRight,
  X,
  Bookmark,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
};
export function Header({
  compact = false,
  editorial = false,
}: {
  compact?: boolean;
  editorial?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(true);
  const navigationId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 701px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header
        ref={headerRef}
        className={`site-header ${compact ? "compact" : ""}`}
      >
        <Link href="/" className="wordmark" aria-label="Japan, Your Way home">
          <span className="brand-mark" aria-hidden="true">
            {editorial ? (
              "道"
            ) : (
              <>
                <span />
                <span />
                <span />
              </>
            )}
          </span>
          <span>
            Japan, Your Way<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav
          ref={navRef}
          id={navigationId}
          data-instant={instant}
          aria-label="Main navigation"
          className={open ? "open" : ""}
        >
          <Link href="/trips/" onClick={() => setOpen(false)}>
            Trips
          </Link>
          <Link href="/how-it-works/" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/help/" onClick={() => setOpen(false)}>
            Help
          </Link>
          <Link
            href="/saved/"
            className="saved-nav"
            onClick={() => setOpen(false)}
          >
            <Bookmark size={16} /> Saved plans
          </Link>
        </nav>
        <Link href="/plan/" className="button header-action">
          Plan my Japan <ArrowUpRight size={17} />
        </Link>
        <button
          ref={menuRef}
          className="menu-button icon-button"
          onClick={(event) => {
            setInstant(event.detail === 0);
            setOpen(!open);
          }}
          aria-expanded={open}
          aria-controls={navigationId}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <Link className="footer-brand" href="/">
        Japan, Your Way.
      </Link>
      <p>A little wonder. A clearer plan.</p>
      <div>
        <Link href="/help/">Help & privacy</Link>
        <Link href="/credits/">Image credits</Link>
        <span>Concept demo · 2026</span>
      </div>
    </footer>
  );
}
export function Status({
  state,
  small = false,
}: {
  state: Fit;
  small?: boolean;
}) {
  const Icon = state === "Fits" ? CheckCircle2 : AlertCircle;
  return (
    <span
      className={`status ${state === "Fits" ? "fit" : state === "Conflict" ? "conflict" : "check"} ${small ? "small" : ""}`}
    >
      <Icon size={small ? 13 : 15} />
      {state}
    </span>
  );
}
export function Reveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("seen");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    const active = document.activeElement as HTMLElement;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      active?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-head">
        <h2 id="dialog-title">{title}</h2>
        <button
          onClick={onClose}
          className="icon-button"
          aria-label="Close dialog"
        >
          <X size={22} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
