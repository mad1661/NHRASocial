import {
  resolveConnectorSettings,
  hasNhraEventSettings,
  type ConnectorSettingsValues,
} from "@/lib/connector-settings";
import type { ProvisionedUserContext } from "@/lib/auth/provision";
import { activeEvent } from "@/lib/sample-data";
import type { ConnectorState, EventContext } from "@/lib/types";

interface EventConnectorResult {
  connector: ConnectorState;
  event: EventContext;
}

function fallbackResult(
  detail: string,
  status: ConnectorState["status"],
): EventConnectorResult {
  return {
    connector: {
      id: "event-results",
      name: "NHRA event feed",
      status,
      detail,
    },
    event: activeEvent,
  };
}

function normalizeEvent(payload: Record<string, unknown>): EventContext {
  const classes = Array.isArray(payload.classes)
    ? payload.classes.filter((value): value is string => typeof value === "string")
    : activeEvent.classes;

  const stage = payload.stage;

  return {
    id: typeof payload.id === "string" ? payload.id : activeEvent.id,
    name: typeof payload.name === "string" ? payload.name : activeEvent.name,
    track: typeof payload.track === "string" ? payload.track : activeEvent.track,
    location: typeof payload.location === "string" ? payload.location : activeEvent.location,
    dateRange:
      typeof payload.dateRange === "string" ? payload.dateRange : activeEvent.dateRange,
    stage:
      stage === "pre-race" ||
      stage === "qualifying" ||
      stage === "eliminations" ||
      stage === "finals" ||
      stage === "post-event"
        ? stage
        : activeEvent.stage,
    classes,
    headline:
      typeof payload.headline === "string" ? payload.headline : activeEvent.headline,
  };
}

export async function getNhraEvent(
  user?: ProvisionedUserContext | null,
  overrides: Partial<ConnectorSettingsValues> = {},
): Promise<EventConnectorResult> {
  const settings = await resolveConnectorSettings(user, overrides);

  if (!hasNhraEventSettings(settings)) {
    return fallbackResult(
      "Set an NHRA event feed URL in the interface or environment to load live event data.",
      "missing-config",
    );
  }

  try {
    const response = await fetch(settings.nhraEventFeedUrl ?? "", {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return fallbackResult(
        `Event feed failed with ${response.status}; using fallback event data.`,
        "error",
      );
    }

    const payload = (await response.json()) as Record<string, unknown>;

    return {
      connector: {
        id: "event-results",
        name: "NHRA event feed",
        status: "live",
        detail: "Loaded live NHRA event context from the configured feed.",
      },
      event: normalizeEvent(payload),
    };
  } catch (error) {
    return fallbackResult(
      `Event feed failed: ${error instanceof Error ? error.message : "unknown error"}.`,
      "error",
    );
  }
}
