"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { regionActivityIdeas, type ActivityFilter } from "@/data/japan-activities";
import { activityPrefectures } from "@/data/activity-prefectures";
import {
  prefectureGuides,
  prefectureGuideUrl,
} from "@/data/prefecture-guides";

type Props = {
  regionId: string;
  regionName: string;
  prefectures: string[];
  interest?: ActivityFilter;
};

export function PrefectureExplorer({
  regionId,
  regionName,
  prefectures,
  interest = "all",
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const guide = selected ? prefectureGuides[selected] : null;
  const matchingIdeas = regionActivityIdeas[regionId].filter(
    (idea) => interest === "all" || idea.category === interest,
  );
  const localIdeas = selected ? matchingIdeas.filter((idea) =>
    activityPrefectures[idea.title]?.includes(selected),
  ) : [];
  const suggestedIdeas = (localIdeas.length ? localIdeas : matchingIdeas).slice(0, 2);

  function choosePrefecture(prefecture: string) {
    const next = selected === prefecture ? null : prefecture;
    setSelected(next);
    if (next) requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" }));
  }

  return (
    <div className="prefecture-explorer">
      <div className="prefecture-explorer-heading">
        <strong>Explore prefectures</strong>
        <span>Choose one for details</span>
      </div>
      <div className="prefecture-picker" role="group" aria-label={`Prefectures in ${regionName}`}>
        {prefectures.map((prefecture) => (
          <button
            type="button"
            key={prefecture}
            aria-expanded={selected === prefecture}
            aria-controls={panelId}
            onClick={() => choosePrefecture(prefecture)}
          >
            <span>{prefecture}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div
        id={panelId}
        ref={panelRef}
        className="prefecture-spotlight"
        hidden={!selected}
        aria-live="polite"
      >
        {selected && guide && (
          <>
            <div className="prefecture-spotlight-heading">
              <h4>{selected}</h4>
              <button type="button" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
            <p>{guide.summary}</p>
            <div className="prefecture-spotlight-places">
              <span>Places to explore</span>
              <ul>
                {guide.places.map((place) => (
                  <li key={place}>{place}</li>
                ))}
              </ul>
            </div>
            {suggestedIdeas.length > 0 && <div className="prefecture-spotlight-places prefecture-regional-ideas">
              <span>{localIdeas.length ? `Ideas in ${selected}` : `Ideas elsewhere in ${regionName}`}</span>
              <ul>{suggestedIdeas.map((idea) => <li key={idea.title}>{idea.title} · {idea.place}</li>)}</ul>
            </div>}
            <div className="prefecture-spotlight-actions">
              <a href={prefectureGuideUrl(regionId, selected)} target="_blank" rel="noreferrer">Official {selected} guide ↗</a>
              <Link href={`/explore/#${regionId}`}>Explore {regionName} ↗</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
