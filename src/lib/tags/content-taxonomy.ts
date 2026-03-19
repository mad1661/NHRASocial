import type { ContentType, MediaFormat, PublishWindow } from "@/lib/types";

export const contentTypes: Record<ContentType, string> = {
  result: "Immediate race results, ladders, winners, and elimination updates.",
  upset: "Unexpected outcomes, giant-killer runs, or bracket chaos.",
  record: "Track records, ET highs, speed milestones, and historic moments.",
  rivalry: "Head-to-head storylines, rematches, and tension between contenders.",
  "behind-the-scenes": "Pit footage, crew prep, access, and candid in-lane moments.",
  explainer: "Rule breakdowns, class primers, tech stories, and beginner-friendly context.",
  sponsor: "Partner integration that still ties to a meaningful race storyline.",
  "fan-reaction": "Crowd response, creator-style reactions, and social proof from fans.",
};

export const mediaFormats: Record<MediaFormat, string> = {
  "short-clip": "Fast vertical or square clips built for immediate replay value.",
  recap: "Polished stitched summary of a session, round, or full event window.",
  carousel: "Swipeable recap, stat stack, or before/after storytelling format.",
  static: "Single-image result card or graphic with a sharp hook.",
  quote: "Driver or crew line pulled into a text-first creative.",
  "live-update": "Rapid scorekeeping and in-the-moment posting during active racing.",
};

export const publishWindows: Record<PublishWindow, string> = {
  "pre-race": "Preview and anticipation window before cars fire.",
  qualifying: "Early sessions where setup stories and pace setting matter.",
  eliminations: "Fastest-moving drama with bracket progression and upset potential.",
  finals: "Championship tone, decisive runs, and sponsor-value moments.",
  "post-event": "Reflection, recap, next-stop momentum, and evergreen packaging.",
};

export const storylineClusters = [
  "hero run",
  "regional hometown angle",
  "crew hustle",
  "weather swing",
  "sponsor payoff",
  "family legacy",
  "rookie watch",
  "record chase",
];
