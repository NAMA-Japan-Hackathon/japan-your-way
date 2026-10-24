"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import regions from "@/data/regions.json";
import { regionPortraits } from "@/data/region-portraits";
import { prefectureGuides, prefectureGuideUrl } from "@/data/prefecture-guides";
import { activityPrefectures } from "@/data/activity-prefectures";
import {
  activityFilters,
  regionActivityIdeas,
  type ActivityFilter,
} from "@/data/japan-activities";

type Props = { interest: ActivityFilter };

export function PrefectureFinder({ interest }: Props) {
  const [regionId, setRegionId] = useState(regions[0].id);
  const [prefecture, setPrefecture] = useState(regions[0].prefectures[0]);
  const region = regions.find((item) => item.id === regionId)!;
  const portrait = regionPortraits[regionId];
  const guide = prefectureGuides[prefecture];
  const matchingIdeas = regionActivityIdeas[regionId].filter(
    (idea) => interest === "all" || idea.category === interest,
  );
  const localIdeas = matchingIdeas.filter((idea) =>
    activityPrefectures[idea.title]?.includes(prefecture),
  );
  const suggestedIdeas = localIdeas.length ? localIdeas : matchingIdeas;
  const interestLabel = activityFilters.find((item) => item.id === interest)?.label;
  const countMatches = (id: string, place?: string) =>
    regionActivityIdeas[id].filter((idea) =>
      (interest === "all" || idea.category === interest) &&
      (!place || activityPrefectures[idea.title]?.includes(place)),
    ).length;

  function chooseRegion(nextId: string) {
    const nextRegion = regions.find((item) => item.id === nextId)!;
    setRegionId(nextId);
    setPrefecture(nextRegion.prefectures[0]);
  }

  return (
    <div className="prefecture-finder" aria-label="Choose a Japan prefecture">
      <div className="prefecture-finder-intro">
        <div>
          <h3>Find the place that fits.</h3>
          <p>Choose a region, then a prefecture. {interest === "all"
            ? "Your activity choice shapes the nearby ideas."
            : `Numbers show curated ${interestLabel?.toLowerCase()} ideas. Every prefecture stays open.`}</p>
        </div>
        <span>47 prefectures · 10 regions</span>
      </div>
      <div className="finder-regions" role="group" aria-label="Choose a region">
        {regions.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={item.id === regionId}
            onClick={() => chooseRegion(item.id)}
          >
            {item.name}
            {interest !== "all" && <small aria-hidden="true">{countMatches(item.id)}</small>}
          </button>
        ))}
      </div>
      <div className="finder-body">
        <div className="finder-map-choice">
          <p className="finder-step"><MapPin size={16} aria-hidden="true" /> Choose a prefecture in {region.name}</p>
          <div className="finder-prefectures" role="group" aria-label={`Choose a prefecture in ${region.name}`}>
            {region.prefectures.map((item) => (
              <button
                type="button"
                key={item}
                aria-pressed={prefecture === item}
                onClick={() => setPrefecture(item)}
              >
                {item}
                {interest !== "all" && countMatches(regionId, item) > 0 &&
                  <small aria-hidden="true">{countMatches(regionId, item)}</small>}
              </button>
            ))}
          </div>
        </div>
        <div className="finder-result" aria-live="polite">
          <p className="finder-result-location">{region.name} / {prefecture}</p>
          <h4>{prefecture}</h4>
          <p className="finder-result-summary">{guide.summary}</p>
          <div className="finder-detail-columns">
            <div>
              <strong>Start with these places</strong>
              <ul>{guide.places.map((place) => <li key={place}>{place}</li>)}</ul>
            </div>
            <div>
              <strong>{localIdeas.length
                ? interest === "all" ? `Ideas in ${prefecture}` : `${interestLabel} in ${prefecture}`
                : interest === "all" ? `Ideas elsewhere in ${region.name}` : `${interestLabel} elsewhere in ${region.name}`}</strong>
              {suggestedIdeas.length ? (
                <ul>{suggestedIdeas.slice(0, 3).map((idea) => <li key={idea.title}>{idea.title} <span>· {idea.place}</span></li>)}</ul>
              ) : (
                <p className="finder-no-match">No curated {interestLabel?.toLowerCase()} idea in this region yet. Try another interest or open the official guide.</p>
              )}
            </div>
          </div>
          <div className="finder-actions">
            <Link className="finder-plan-link" href={`/plan/?region=${encodeURIComponent(regionId)}&prefecture=${encodeURIComponent(prefecture)}&interest=${encodeURIComponent(interest)}`}>
              Plan with {prefecture} <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <a href={prefectureGuideUrl(regionId, prefecture)} target="_blank" rel="noreferrer">
              Official {prefecture} guide <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <Link href={`/explore/#${regionId}`}>
              Explore {region.name} <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <p className="finder-source">Places and descriptions are based on Japan National Tourism Organization guides. Seasonal access and events should be checked before travel.</p>
        </div>
        <div className="finder-photo">
          <img src={portrait.image} alt={portrait.alt} loading="lazy" />
          <span>Regional view · {portrait.photoPlace}</span>
        </div>
      </div>
    </div>
  );
}
