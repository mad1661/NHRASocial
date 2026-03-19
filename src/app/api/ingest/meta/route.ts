import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth/session";
import { getMetaOwnedPosts } from "@/lib/connectors/meta";

export async function GET() {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const metaResult = await getMetaOwnedPosts(currentUser);

  return NextResponse.json({
    source: metaResult.connector,
    postCount: metaResult.posts.length,
    latestPosts: metaResult.posts,
  });
}
