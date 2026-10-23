"use client";

import { useEffect, useState } from "react";
import { BorderBeam } from "border-beam";
import { ArrowUpRight } from "lucide-react";

export function PlanAction() {
  const [hovered, setHovered] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia(
      "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)",
    );
    const update = () => setAllowed(motion.matches && !document.hidden);
    update();
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <BorderBeam
      className="plan-action"
      size="pulse-inner"
      colorVariant="mono"
      theme="light"
      strength={0.35}
      active={hovered && allowed}
      onPointerEnter={(event) => setHovered(event.pointerType === "mouse")}
      onPointerLeave={() => setHovered(false)}
    >
      <button className="button" type="submit">
        Start my Japan plan <ArrowUpRight size={18} />
      </button>
    </BorderBeam>
  );
}
