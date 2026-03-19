import {
  resolveConnectorSettings,
  hasYouTubeSettings,
  type ConnectorSettingsValues,
} from "@/lib/connector-settings";
import type { ProvisionedUserContext } from "@/lib/auth/provision";
import { activeEvent, ownedPosts } from "@/lib/sample-data";
import type { ConnectorState, ContentPost } from "@/lib/types";

interface YouTubeConnectorResult {
  connector: ConnectorState;
  posts: ContentPost[];
}

function fallbackResult(
  detail: string,
  status: ConnectorState["status"],
): YouTubeConnectorResult {
  return {
    connector: {
      id: "youtube-owned",
      name: "YouTube channel analytics",
      status,
      detail,
    },
    posts: ownedPosts.filter((post) => post.platform === "youtube"),
  };
}

function buildContentType(title: string): ContentPost["contentType"] {
  const normalized = title.toLowerCase();

  if (normalized.includes("record")) return "record";
  if (normalized.includes("upset")) return "upset";
  if (normalized.includes("behind")) return "behind-the-scenes";
  if (normalized.includes("reaction")) return "fan-reaction";

  return "result";
}

export async function getYouTubeOwnedPosts(
  user?: ProvisionedUserContext | null,
  overrides: Partial<ConnectorSettingsValues> = {},
): Promise<YouTubeConnectorResult> {
  const settings = await resolveConnectorSettings(user, overrides);

  if (!hasYouTubeSettings(settings)) {
    return fallbackResult(
      "Set YouTube credentials in the interface or environment to enable live pulls.",
      "missing-config",
    );
  }

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("channelId", settings.youtubeChannelId ?? "");
  searchUrl.searchParams.set("maxResults", "10");
  searchUrl.searchParams.set("order", "date");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("key", settings.youtubeApiKey ?? "");

  try {
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 900 },
    });

    if (!searchResponse.ok) {
      return fallbackResult(
        `YouTube search failed with ${searchResponse.status}; showing fallback sample data.`,
        "error",
      );
    }

    const searchPayload = (await searchResponse.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          publishedAt?: string;
          title?: string;
          description?: string;
        };
      }>;
    };
    const videoIds = (searchPayload.items ?? [])
      .map((item) => item.id?.videoId)
      .filter((value): value is string => Boolean(value));

    if (videoIds.length === 0) {
      return fallbackResult("YouTube returned no recent videos; showing fallback sample data.", "fallback");
    }

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    videosUrl.searchParams.set("id", videoIds.join(","));
    videosUrl.searchParams.set("key", settings.youtubeApiKey ?? "");

    const videosResponse = await fetch(videosUrl, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 900 },
    });

    if (!videosResponse.ok) {
      return fallbackResult(
        `YouTube videos lookup failed with ${videosResponse.status}; showing fallback sample data.`,
        "error",
      );
    }

    const videosPayload = (await videosResponse.json()) as {
      items?: Array<{
        id?: string;
        snippet?: {
          title?: string;
          description?: string;
          publishedAt?: string;
        };
        statistics?: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }>;
    };

    const livePosts: ContentPost[] = (videosPayload.items ?? []).map((item) => {
      const title = item.snippet?.title ?? "NHRA YouTube post";
      const description = item.snippet?.description ?? "";
      const views = Number(item.statistics?.viewCount ?? 0);
      const likes = Number(item.statistics?.likeCount ?? 0);
      const comments = Number(item.statistics?.commentCount ?? 0);

      return {
        id: item.id ?? `youtube-${title}`,
        platform: "youtube",
        account: "NHRA",
        createdAt: item.snippet?.publishedAt ?? new Date().toISOString(),
        headline: title,
        summary: description,
        contentType: buildContentType(title),
        mediaFormat: "recap",
        publishWindow: activeEvent.stage,
        driver: "NHRA field",
        team: "NHRA",
        sponsor: "Unknown",
        eventId: activeEvent.id,
        tags: ["youtube-live", "owned"],
        snapshot: {
          views,
          engagements: likes + comments,
          shares: 0,
          saves: 0,
          clicks: Math.round(views * 0.02),
          conversions: Math.round(views * 0.002),
        },
      };
    });

    return {
      connector: {
        id: "youtube-owned",
        name: "YouTube channel analytics",
        status: "live",
        detail: `Loaded ${livePosts.length} live YouTube videos from the configured channel.`,
      },
      posts: livePosts,
    };
  } catch (error) {
    return fallbackResult(
      `YouTube fetch failed: ${error instanceof Error ? error.message : "unknown error"}.`,
      "error",
    );
  }
}
