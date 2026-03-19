import { NextResponse } from "next/server";

import { competitorPosts } from "@/lib/sample-data";
import { getCompetitorDigest } from "@/lib/scoring/recommendations";

export async function GET() {
  return NextResponse.json({
    trackedAccounts: [...new Set(competitorPosts.map((post) => post.account))],
    digest: getCompetitorDigest(competitorPosts),
    note: "Public competitor monitoring should stay terms-compliant and focus on visible signals.",
  });
}
