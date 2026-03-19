function readOptional(name: string) {
  const value = process.env[name];

  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const appEnv = {
  firebaseApiKey: readOptional("NEXT_PUBLIC_FIREBASE_API_KEY"),
  firebaseAuthDomain: readOptional("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  firebaseProjectId: readOptional("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  firebaseStorageBucket: readOptional("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  firebaseMessagingSenderId: readOptional(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  ),
  firebaseAppId: readOptional("NEXT_PUBLIC_FIREBASE_APP_ID"),
  firebaseAdminProjectId: readOptional("FIREBASE_ADMIN_PROJECT_ID"),
  firebaseAdminClientEmail: readOptional("FIREBASE_ADMIN_CLIENT_EMAIL"),
  firebaseAdminPrivateKey: readOptional("FIREBASE_ADMIN_PRIVATE_KEY"),
  metaAccessToken: readOptional("META_ACCESS_TOKEN"),
  instagramBusinessAccountId: readOptional("META_INSTAGRAM_BUSINESS_ACCOUNT_ID"),
  facebookPageId: readOptional("META_FACEBOOK_PAGE_ID"),
  youtubeApiKey: readOptional("YOUTUBE_API_KEY"),
  youtubeChannelId: readOptional("YOUTUBE_CHANNEL_ID"),
  nhraEventFeedUrl: readOptional("NHRA_EVENT_FEED_URL"),
};

export function hasFirebaseAdminConfig() {
  return Boolean(
    appEnv.firebaseAdminProjectId &&
      appEnv.firebaseAdminClientEmail &&
      appEnv.firebaseAdminPrivateKey,
  );
}

export function hasMetaConfig() {
  return Boolean(
    appEnv.metaAccessToken &&
      (appEnv.instagramBusinessAccountId || appEnv.facebookPageId),
  );
}

export function hasYouTubeConfig() {
  return Boolean(appEnv.youtubeApiKey && appEnv.youtubeChannelId);
}

export function hasNhraEventConfig() {
  return Boolean(appEnv.nhraEventFeedUrl);
}
