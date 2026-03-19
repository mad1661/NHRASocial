export type Platform = "instagram" | "facebook" | "youtube";

export type ContentType =
  | "result"
  | "upset"
  | "record"
  | "rivalry"
  | "behind-the-scenes"
  | "explainer"
  | "sponsor"
  | "fan-reaction";

export type MediaFormat =
  | "short-clip"
  | "recap"
  | "carousel"
  | "static"
  | "quote"
  | "live-update";

export type PublishWindow =
  | "pre-race"
  | "qualifying"
  | "eliminations"
  | "finals"
  | "post-event";

export interface EventContext {
  id: string;
  name: string;
  track: string;
  location: string;
  dateRange: string;
  stage: PublishWindow;
  classes: string[];
  headline: string;
}

export interface PerformanceSnapshot {
  views: number;
  engagements: number;
  shares: number;
  saves: number;
  clicks: number;
  conversions: number;
  watchTimeMinutes?: number;
}

export interface ContentPost {
  id: string;
  platform: Platform;
  account: string;
  createdAt: string;
  headline: string;
  summary: string;
  contentType: ContentType;
  mediaFormat: MediaFormat;
  publishWindow: PublishWindow;
  driver: string;
  team: string;
  sponsor: string;
  eventId: string;
  tags: string[];
  snapshot: PerformanceSnapshot;
}

export interface CompetitorPost {
  id: string;
  account: string;
  platform: Platform;
  publishedAt: string;
  hook: string;
  mediaFormat: MediaFormat;
  contentType: ContentType;
  eventId: string;
  visibleEngagements: number;
  visibleViews?: number;
  tags: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  confidence: number;
  nextAction: string;
  focusPlatform: Platform;
  priority: "high" | "medium" | "low";
  supportingSignals: string[];
}

export interface ExperimentLogEntry {
  id: string;
  hypothesis: string;
  testWindow: string;
  result: "winning" | "promising" | "paused";
  learning: string;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  type: "owned" | "internal" | "public";
  cadence: string;
  status: "ready" | "planned" | "watching";
  value: string;
  notes: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  status: "now" | "next" | "later";
}

export interface ConnectorState {
  id: string;
  name: string;
  status: "live" | "fallback" | "missing-config" | "error";
  detail: string;
}

export interface PlatformScore {
  platform: Platform;
  score: number;
  engagementRate: number;
  conversionRate: number;
  winningFormat: MediaFormat;
  winningTheme: ContentType;
}

export interface DashboardData {
  activeEvent: EventContext;
  ownedPosts: ContentPost[];
  competitorPosts: CompetitorPost[];
  experimentLog: ExperimentLogEntry[];
  dataSourceMap: DataSourceStatus[];
  roadmap: RoadmapMilestone[];
  connectors: ConnectorState[];
}
