import { dataSourceMap } from "@/lib/data-source-map";
import { roadmap } from "@/lib/roadmap";
import type { ProvisionedUserContext } from "@/lib/auth/provision";
import {
  competitorPosts,
  experimentLog,
} from "@/lib/sample-data";
import { getNhraEvent } from "@/lib/connectors/event-feed";
import { getMetaOwnedPosts } from "@/lib/connectors/meta";
import { getYouTubeOwnedPosts } from "@/lib/connectors/youtube";
import type { DashboardData, DataSourceStatus } from "@/lib/types";

function mergeSourceStatuses(
  connectorStatuses: DashboardData["connectors"],
): DataSourceStatus[] {
  return dataSourceMap.map((source) => {
    const connector = connectorStatuses.find((item) => item.id === source.id);

    if (!connector) {
      return source;
    }

    const status =
      connector.status === "live"
        ? "ready"
        : connector.status === "fallback"
          ? "planned"
          : connector.status === "missing-config"
            ? "planned"
            : "watching";

    return {
      ...source,
      status,
      notes: `${source.notes} ${connector.detail}`.trim(),
    };
  });
}

export async function getDashboardData(
  user: ProvisionedUserContext,
): Promise<DashboardData> {
  const [metaResult, youtubeResult, eventResult] = await Promise.all([
    getMetaOwnedPosts(user),
    getYouTubeOwnedPosts(user),
    getNhraEvent(user),
  ]);

  const connectors = [
    metaResult.connector,
    youtubeResult.connector,
    eventResult.connector,
  ];

  return {
    activeEvent: eventResult.event,
    ownedPosts: [...metaResult.posts, ...youtubeResult.posts],
    competitorPosts,
    experimentLog,
    dataSourceMap: mergeSourceStatuses(connectors),
    roadmap,
    connectors,
  };
}
