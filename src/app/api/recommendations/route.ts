import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/live-data";
import {
  getBoardSummary,
  getPlatformScores,
  getRecommendations,
} from "@/lib/scoring/recommendations";

export async function GET() {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const data = await getDashboardData(currentUser);

  return NextResponse.json({
    event: data.activeEvent,
    board: getBoardSummary(data.ownedPosts, data.activeEvent),
    platformScores: getPlatformScores(data.ownedPosts, data.activeEvent),
    recommendations: getRecommendations(
      data.ownedPosts,
      data.competitorPosts,
      data.activeEvent,
    ),
    dataSources: data.dataSourceMap,
    connectors: data.connectors,
    experiments: data.experimentLog,
  });
}
