import { appEnv } from "@/lib/env";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import type { ProvisionedUserContext } from "@/lib/auth/provision";

export interface ConnectorSettingsValues {
  metaAccessToken?: string;
  instagramBusinessAccountId?: string;
  facebookPageId?: string;
  youtubeApiKey?: string;
  youtubeChannelId?: string;
  nhraEventFeedUrl?: string;
}

export type ConnectorSettingsKey = keyof ConnectorSettingsValues;

export interface ConnectorSettingsSummaryField {
  key: ConnectorSettingsKey;
  label: string;
  secret: boolean;
  configured: boolean;
  source: "interface" | "environment" | "missing";
  maskedValue?: string;
}

const connectorFieldDefinitions: Array<{
  key: ConnectorSettingsKey;
  label: string;
  secret: boolean;
}> = [
  { key: "metaAccessToken", label: "Meta access token", secret: true },
  {
    key: "instagramBusinessAccountId",
    label: "Meta Instagram business account id",
    secret: false,
  },
  { key: "facebookPageId", label: "Meta Facebook page id", secret: false },
  { key: "youtubeApiKey", label: "YouTube API key", secret: true },
  { key: "youtubeChannelId", label: "YouTube channel id", secret: false },
  { key: "nhraEventFeedUrl", label: "NHRA event feed URL", secret: false },
];

function sanitizeValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeSettings(
  values: Partial<ConnectorSettingsValues>,
): ConnectorSettingsValues {
  return {
    metaAccessToken: sanitizeValue(values.metaAccessToken),
    instagramBusinessAccountId: sanitizeValue(values.instagramBusinessAccountId),
    facebookPageId: sanitizeValue(values.facebookPageId),
    youtubeApiKey: sanitizeValue(values.youtubeApiKey),
    youtubeChannelId: sanitizeValue(values.youtubeChannelId),
    nhraEventFeedUrl: sanitizeValue(values.nhraEventFeedUrl),
  };
}

function compactSettings(values: ConnectorSettingsValues) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  ) as ConnectorSettingsValues;
}

export function normalizeConnectorSettings(
  values: Partial<ConnectorSettingsValues>,
): ConnectorSettingsValues {
  return sanitizeSettings(values);
}

function maskValue(value: string, secret: boolean) {
  if (!secret) {
    return value;
  }

  const visible = value.slice(-4);
  return `${"*".repeat(Math.max(4, value.length - Math.min(4, value.length)))}${visible}`;
}

function getWorkspaceConnectorDoc(workspaceId: string) {
  return getFirebaseAdminDb()
    .collection("workspaces")
    .doc(workspaceId)
    .collection("connectorProfiles")
    .doc("primary");
}

export async function readStoredConnectorSettings(
  user: ProvisionedUserContext,
): Promise<ConnectorSettingsValues> {
  const snapshot = await getWorkspaceConnectorDoc(user.workspaceId).get();

  if (!snapshot.exists) {
    return {};
  }

  return sanitizeSettings(
    (snapshot.data()?.values as Partial<ConnectorSettingsValues> | undefined) ?? {},
  );
}

export async function writeStoredConnectorSettings(
  user: ProvisionedUserContext,
  values: ConnectorSettingsValues,
): Promise<ConnectorSettingsValues> {
  const compactedValues = compactSettings(values);

  await getWorkspaceConnectorDoc(user.workspaceId).set(
    {
      workspaceId: user.workspaceId,
      ownerUid: user.uid,
      values: compactedValues,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return compactedValues;
}

export async function saveConnectorSettings(
  user: ProvisionedUserContext,
  update: {
    values: Partial<ConnectorSettingsValues>;
    clearKeys?: ConnectorSettingsKey[];
  },
) {
  const existing = await readStoredConnectorSettings(user);
  const next: ConnectorSettingsValues = { ...existing };

  for (const [key, value] of Object.entries(sanitizeSettings(update.values)) as Array<
    [ConnectorSettingsKey, string | undefined]
  >) {
    if (value !== undefined) {
      next[key] = value;
    }
  }

  for (const key of update.clearKeys ?? []) {
    delete next[key];
  }

  return writeStoredConnectorSettings(user, next);
}

export async function getResolvedConnectorSettings(
  user?: ProvisionedUserContext | null,
): Promise<ConnectorSettingsValues> {
  const stored = user ? await readStoredConnectorSettings(user) : {};

  return {
    metaAccessToken: stored.metaAccessToken ?? appEnv.metaAccessToken,
    instagramBusinessAccountId:
      stored.instagramBusinessAccountId ?? appEnv.instagramBusinessAccountId,
    facebookPageId: stored.facebookPageId ?? appEnv.facebookPageId,
    youtubeApiKey: stored.youtubeApiKey ?? appEnv.youtubeApiKey,
    youtubeChannelId: stored.youtubeChannelId ?? appEnv.youtubeChannelId,
    nhraEventFeedUrl: stored.nhraEventFeedUrl ?? appEnv.nhraEventFeedUrl,
  };
}

export async function resolveConnectorSettings(
  user?: ProvisionedUserContext | null,
  overrides: Partial<ConnectorSettingsValues> = {},
): Promise<ConnectorSettingsValues> {
  const resolved = await getResolvedConnectorSettings(user);
  const normalizedOverrides = normalizeConnectorSettings(overrides);

  return {
    metaAccessToken: normalizedOverrides.metaAccessToken ?? resolved.metaAccessToken,
    instagramBusinessAccountId:
      normalizedOverrides.instagramBusinessAccountId ?? resolved.instagramBusinessAccountId,
    facebookPageId: normalizedOverrides.facebookPageId ?? resolved.facebookPageId,
    youtubeApiKey: normalizedOverrides.youtubeApiKey ?? resolved.youtubeApiKey,
    youtubeChannelId: normalizedOverrides.youtubeChannelId ?? resolved.youtubeChannelId,
    nhraEventFeedUrl: normalizedOverrides.nhraEventFeedUrl ?? resolved.nhraEventFeedUrl,
  };
}

export async function getConnectorSettingsSummary(
  user?: ProvisionedUserContext | null,
) {
  const stored = user ? await readStoredConnectorSettings(user) : {};
  const resolved = await getResolvedConnectorSettings(user);

  return connectorFieldDefinitions.map((field) => {
    const storedValue = stored[field.key];
    const resolvedValue = resolved[field.key];

    return {
      key: field.key,
      label: field.label,
      secret: field.secret,
      configured: Boolean(resolvedValue),
      source: storedValue ? "interface" : resolvedValue ? "environment" : "missing",
      maskedValue: resolvedValue ? maskValue(resolvedValue, field.secret) : undefined,
    } satisfies ConnectorSettingsSummaryField;
  });
}

export function hasMetaSettings(values: ConnectorSettingsValues) {
  return Boolean(
    values.metaAccessToken &&
      (values.instagramBusinessAccountId || values.facebookPageId),
  );
}

export function hasYouTubeSettings(values: ConnectorSettingsValues) {
  return Boolean(values.youtubeApiKey && values.youtubeChannelId);
}

export function hasNhraEventSettings(values: ConnectorSettingsValues) {
  return Boolean(values.nhraEventFeedUrl);
}
