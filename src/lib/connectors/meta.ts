import {
  resolveConnectorSettings,
  hasMetaSettings,
  type ConnectorSettingsValues,
} from "@/lib/connector-settings";
import type { ProvisionedUserContext } from "@/lib/auth/provision";
import { activeEvent, ownedPosts } from "@/lib/sample-data";
import type { ConnectorState, ContentPost } from "@/lib/types";

interface MetaConnectorResult {
  connector: ConnectorState;
  posts: ContentPost[];
}

interface MetaInsightValue {
  value?: number | Record<string, unknown>;
}

interface MetaInsight {
  name?: string;
  values?: MetaInsightValue[];
}

function fallbackResult(detail: string, status: ConnectorState["status"]): MetaConnectorResult {
  return {
    connector: {
      id: "meta-owned",
      name: "Meta owned account insights",
      status,
      detail,
    },
    posts: ownedPosts.filter(
      (post) => post.platform === "instagram" || post.platform === "facebook",
    ),
  };
}

function mapMediaTypeToFormat(mediaType: string | undefined): ContentPost["mediaFormat"] {
  switch (mediaType) {
    case "CAROUSEL_ALBUM":
      return "carousel";
    case "IMAGE":
      return "static";
    case "STORY":
      return "live-update";
    case "REELS":
    case "VIDEO":
    default:
      return "short-clip";
  }
}

function buildContentType(caption: string | undefined): ContentPost["contentType"] {
  const normalized = (caption ?? "").toLowerCase();

  if (normalized.includes("record")) return "record";
  if (normalized.includes("behind")) return "behind-the-scenes";
  if (normalized.includes("sponsor")) return "sponsor";
  if (normalized.includes("upset")) return "upset";

  return "result";
}

function normalizeMetaPost(post: Record<string, unknown>): ContentPost {
  const insights = (post.insights as { data?: MetaInsight[] } | undefined)?.data ?? [];
  const metrics = new Map<string, number>();

  for (const insight of insights) {
    const name = typeof insight.name === "string" ? insight.name : undefined;
    const firstValue = insight.values?.[0]?.value;
    const value = typeof firstValue === "number"
      ? firstValue
      : typeof firstValue === "object" && firstValue !== null
        ? Number(
            Object.values(firstValue).find(
              (entry) => typeof entry === "number",
            ) ?? 0,
          )
        : 0;

    if (name) {
      metrics.set(name, Number.isFinite(value) ? value : 0);
    }
  }

  const caption = typeof post.caption === "string" ? post.caption : "NHRA owned post";
  const headline = caption.split("\n")[0].slice(0, 96) || "NHRA owned post";

  return {
    id: String(post.id ?? `meta-${headline}`),
    platform: "instagram",
    account: "@nhra",
    createdAt: String(post.timestamp ?? new Date().toISOString()),
    headline,
    summary: caption,
    contentType: buildContentType(caption),
    mediaFormat: mapMediaTypeToFormat(typeof post.media_type === "string" ? post.media_type : undefined),
    publishWindow: activeEvent.stage,
    driver: "NHRA field",
    team: "NHRA",
    sponsor: "Unknown",
    eventId: activeEvent.id,
    tags: ["meta-live", "owned"],
    snapshot: {
      views: metrics.get("views") ?? metrics.get("impressions") ?? 0,
      engagements: metrics.get("total_interactions") ?? 0,
      shares: metrics.get("shares") ?? 0,
      saves: metrics.get("saved") ?? 0,
      clicks: metrics.get("profile_visits") ?? 0,
      conversions: 0,
    },
  };
}

export async function getMetaOwnedPosts(
  user?: ProvisionedUserContext | null,
  overrides: Partial<ConnectorSettingsValues> = {},
): Promise<MetaConnectorResult> {
  const settings = await resolveConnectorSettings(user, overrides);

  if (!hasMetaSettings(settings)) {
    return fallbackResult(
      "Set Meta credentials in the interface or environment to enable live Meta pulls.",
      "missing-config",
    );
  }

  const accountId =
    settings.instagramBusinessAccountId ?? settings.facebookPageId;
  const metrics = [
    "views",
    "total_interactions",
    "shares",
    "saved",
    "profile_visits",
  ].join(",");
  const fields = [
    "id",
    "caption",
    "timestamp",
    "media_type",
    `insights.metric(${metrics})`,
  ].join(",");
  const url = new URL(`https://graph.facebook.com/v22.0/${accountId}/media`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", "12");
  url.searchParams.set("access_token", settings.metaAccessToken ?? "");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return fallbackResult(
        `Meta request failed with ${response.status}; showing fallback sample data.`,
        "error",
      );
    }

    const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
    const livePosts = (payload.data ?? []).map(normalizeMetaPost);

    if (livePosts.length === 0) {
      return fallbackResult("Meta returned no recent posts; showing fallback sample data.", "fallback");
    }

    return {
      connector: {
        id: "meta-owned",
        name: "Meta owned account insights",
        status: "live",
        detail: `Loaded ${livePosts.length} live Meta posts from the configured account.`,
      },
      posts: livePosts,
    };
  } catch (error) {
    return fallbackResult(
      `Meta fetch failed: ${error instanceof Error ? error.message : "unknown error"}.`,
      "error",
    );
  }
}
