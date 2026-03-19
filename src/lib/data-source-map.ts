import type { DataSourceStatus } from "@/lib/types";

export const dataSourceMap: DataSourceStatus[] = [
  {
    id: "meta-owned",
    name: "Meta owned account insights",
    type: "owned",
    cadence: "30-60 min on race weekends",
    status: "ready",
    value: "Primary source for views, shares, saves, clicks, and creative timing.",
    notes:
      "Strongest first-party source for Instagram and Facebook performance. Use current views-based metrics.",
  },
  {
    id: "youtube-owned",
    name: "YouTube Studio and Analytics",
    type: "owned",
    cadence: "Hourly",
    status: "ready",
    value: "Adds watch time, video performance, Shorts lift, and evergreen replay value.",
    notes:
      "Normalize Shorts trends carefully because the platform changed view counting in 2025.",
  },
  {
    id: "site-conversions",
    name: "NHRA site, ticket, merch, and newsletter analytics",
    type: "internal",
    cadence: "Hourly or daily",
    status: "planned",
    value: "Connects social winners to actual business outcomes instead of vanity metrics.",
    notes:
      "Needed for ranking sponsor value, ticket lift, and deeper content ROI.",
  },
  {
    id: "event-results",
    name: "Event schedule, results, and race metadata",
    type: "internal",
    cadence: "Live feed or per round",
    status: "ready",
    value: "Provides the motorsports context that explains why a post wins at a specific moment.",
    notes:
      "Should include event, track, class, round, weather, records, and winner status.",
  },
  {
    id: "competitor-watch",
    name: "Public competitor accounts",
    type: "public",
    cadence: "Every few hours",
    status: "watching",
    value: "Useful for timing, hooks, packaging, and creative gaps NHRA can exploit.",
    notes:
      "Best used for public posts and visible engagement, not full-funnel attribution.",
  },
];
