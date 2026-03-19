import type { RoadmapMilestone } from "@/lib/types";

export const roadmap: RoadmapMilestone[] = [
  {
    id: "phase-1",
    title: "Ingestion foundation",
    description:
      "Connect Meta, YouTube, NHRA event metadata, and the first competitor watch list into one shared schema.",
    status: "now",
  },
  {
    id: "phase-2",
    title: "Scoring and recommendations",
    description:
      "Rank content by recency, engagement quality, conversion lift, and race context to surface next-best posts.",
    status: "now",
  },
  {
    id: "phase-3",
    title: "Operator workflow",
    description:
      "Give the social team a race-day board, competitor digest, experiment log, and rationale-rich recommendations.",
    status: "next",
  },
  {
    id: "phase-4",
    title: "Controlled autoresearch loop",
    description:
      "Track recurring hypotheses, compare winners versus baseline, and grow into drafting and scheduling once trusted.",
    status: "later",
  },
];
