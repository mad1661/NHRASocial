import { activeEvent, competitorPosts, ownedPosts } from "@/lib/sample-data";
import type {
  CompetitorPost,
  ContentPost,
  EventContext,
  Platform,
  PlatformScore,
  Recommendation,
} from "@/lib/types";

const nowWeights = {
  engagement: 0.45,
  conversion: 0.25,
  recency: 0.2,
  eventFit: 0.1,
};

function hoursSince(isoTimestamp: string) {
  const current = new Date("2026-03-19T18:00:00Z").getTime();
  const created = new Date(isoTimestamp).getTime();

  return Math.max(1, (current - created) / (1000 * 60 * 60));
}

function computeEngagementRate(post: ContentPost) {
  return post.snapshot.engagements / post.snapshot.views;
}

function computeConversionRate(post: ContentPost) {
  return post.snapshot.conversions / Math.max(1, post.snapshot.clicks);
}

function computeRecency(post: ContentPost) {
  return Math.max(0.1, 1 / hoursSince(post.createdAt));
}

function computeEventFit(post: ContentPost, event: EventContext) {
  return post.publishWindow === event.stage ? 1 : 0.65;
}

function compositeScore(post: ContentPost, event: EventContext) {
  const engagement = computeEngagementRate(post) * nowWeights.engagement;
  const conversion = computeConversionRate(post) * nowWeights.conversion;
  const recency = computeRecency(post) * nowWeights.recency;
  const eventFit = computeEventFit(post, event) * nowWeights.eventFit;

  return (engagement + conversion + recency + eventFit) * 100;
}

function getPlatformPosts(platform: Platform, posts: ContentPost[]) {
  return posts.filter((post) => post.platform === platform);
}

function topByPlatform(platform: Platform, posts: ContentPost[], event: EventContext) {
  return [...getPlatformPosts(platform, posts)].sort(
    (left, right) => compositeScore(right, event) - compositeScore(left, event),
  )[0];
}

function averageRate(posts: ContentPost[], metric: (post: ContentPost) => number) {
  if (posts.length === 0) {
    return 0;
  }

  return posts.reduce((sum, post) => sum + metric(post), 0) / posts.length;
}

export function getPlatformScores(
  posts: ContentPost[] = ownedPosts,
  event: EventContext = activeEvent,
): PlatformScore[] {
  const platforms: Platform[] = ["instagram", "facebook", "youtube"];

  return platforms.map((platform) => {
    const platformPosts = getPlatformPosts(platform, posts);
    const topPost =
      topByPlatform(platform, posts, event) ??
      posts[0];

    if (!topPost) {
      return {
        platform,
        score: 0,
        engagementRate: 0,
        conversionRate: 0,
        winningFormat: "static",
        winningTheme: "result",
      };
    }

    return {
      platform,
      score: Number(compositeScore(topPost, event).toFixed(1)),
      engagementRate: Number((averageRate(platformPosts, computeEngagementRate) * 100).toFixed(1)),
      conversionRate: Number((averageRate(platformPosts, computeConversionRate) * 100).toFixed(1)),
      winningFormat: topPost.mediaFormat,
      winningTheme: topPost.contentType,
    };
  });
}

function competitorSignalSummary(posts: CompetitorPost[]) {
  const fastestCompetitor = [...posts].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  )[0];
  const strongestPublicHook = [...posts].sort(
    (left, right) => right.visibleEngagements - left.visibleEngagements,
  )[0];

  return { fastestCompetitor, strongestPublicHook };
}

export function getRecommendations(
  posts: ContentPost[] = ownedPosts,
  competitors: CompetitorPost[] = competitorPosts,
  event: EventContext = activeEvent,
): Recommendation[] {
  const platformScores = getPlatformScores(posts, event);
  const instagramLeader = platformScores.find(({ platform }) => platform === "instagram");
  const youtubeLeader = platformScores.find(({ platform }) => platform === "youtube");
  const { fastestCompetitor, strongestPublicHook } = competitorSignalSummary(competitors);

  if (!fastestCompetitor || !strongestPublicHook) {
    return [
      {
        id: "rec-fallback",
        title: "Start collecting more live competitor signals",
        rationale:
          "Owned content can already be ranked, but competitor-aware recommendations need more public timing and hook data.",
        confidence: 68,
        nextAction:
          "Track a small watch list of direct competitors and adjacent motorsports accounts every race weekend.",
        focusPlatform: "instagram",
        priority: "medium",
        supportingSignals: [
          `Current event stage is ${event.stage}.`,
          `Owned post sample size: ${posts.length}.`,
        ],
      },
    ];
  }

  return [
    {
      id: "rec-1",
      title: "Prioritize raw driver emotion during eliminations",
      rationale:
        "Instagram short clips with immediate emotional payoff are producing the strongest weighted score in the current event window.",
      confidence: 92,
      nextAction:
        "Post a 10-15 second reaction clip within 20 minutes of each decisive round and keep the caption focused on the run, not the edit.",
      focusPlatform: "instagram",
      priority: "high",
      supportingSignals: [
        `Instagram score ${instagramLeader?.score ?? 0} leads the current stack.`,
        "Behind-the-scenes and fan-reaction clips are outperforming polished packages on rate metrics.",
        "Shares and saves are high enough to justify repeating the format this weekend.",
      ],
    },
    {
      id: "rec-2",
      title: "Use YouTube for context-rich recap and conversion moments",
      rationale:
        "YouTube is not the fastest reaction platform, but it is driving the strongest click and watch-time depth when tied to recap storytelling.",
      confidence: 84,
      nextAction:
        "Publish one event-window recap anchored around an upset, record, or bracket turning point and point viewers toward live coverage or tickets.",
      focusPlatform: "youtube",
      priority: "high",
      supportingSignals: [
        `YouTube conversion rate ${youtubeLeader?.conversionRate ?? 0}% is the healthiest in the owned set.`,
        "Recaps with a clear narrative hook are generating the highest downstream business intent.",
        "Watch time suggests viewers will stay for explanation when the thesis is obvious in the first seconds.",
      ],
    },
    {
      id: "rec-3",
      title: "Beat competitors on bracket speed, then add NHRA-only context",
      rationale:
        "Competitors are winning quick-hit attention by posting simple graphics fast. NHRA can match speed and win on authority.",
      confidence: 79,
      nextAction:
        "Ship a bracket or result card within 10 minutes of round completion, then follow with a second post that explains the why behind the surprise.",
      focusPlatform: fastestCompetitor.platform,
      priority: "medium",
      supportingSignals: [
        `${fastestCompetitor.account} is posting to ${fastestCompetitor.platform} with a rapid turnaround.`,
        `${strongestPublicHook.account} has the strongest visible public hook around emotion and speed.`,
        "Static cards remain highly shareable when they arrive before the conversation settles.",
      ],
    },
  ];
}

export function getBoardSummary(
  posts: ContentPost[] = ownedPosts,
  event: EventContext = activeEvent,
) {
  const sortedPosts = [...posts].sort(
    (left, right) => compositeScore(right, event) - compositeScore(left, event),
  );
  const leadingPost = sortedPosts[0] ?? posts[0];
  const totalViews = posts.reduce((sum, post) => sum + post.snapshot.views, 0);
  const totalEngagements = posts.reduce(
    (sum, post) => sum + post.snapshot.engagements,
    0,
  );
  const totalConversions = posts.reduce(
    (sum, post) => sum + post.snapshot.conversions,
    0,
  );

  return {
    leadingPost,
    totalViews,
    totalEngagements,
    totalConversions,
    nowScore: Number(
      (
        sortedPosts.reduce((sum, post) => sum + compositeScore(post, event), 0) /
        Math.max(1, sortedPosts.length)
      ).toFixed(1),
    ),
  };
}

export function getCompetitorDigest(posts: CompetitorPost[] = competitorPosts) {
  return posts.map((post) => ({
    ...post,
    engagementVelocity: Number(
      (post.visibleEngagements / hoursSince(post.publishedAt)).toFixed(0),
    ),
  }));
}
