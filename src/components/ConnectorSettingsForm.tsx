"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type {
  ConnectorSettingsKey,
  ConnectorSettingsSummaryField,
  ConnectorSettingsValues,
} from "@/lib/connector-settings";

interface ConnectorSettingsFormProps {
  initialFields: ConnectorSettingsSummaryField[];
}

type ConnectorGroupId = "meta" | "youtube" | "event";

interface TestResult {
  tone: "success" | "warning" | "danger";
  message: string;
}

const connectorGroups: Array<{
  id: ConnectorGroupId;
  title: string;
  description: string;
  fields: ConnectorSettingsKey[];
}> = [
  {
    id: "meta",
    title: "Meta",
    description:
      "Use a Meta access token plus either the Instagram business account id or the Facebook page id.",
    fields: ["metaAccessToken", "instagramBusinessAccountId", "facebookPageId"],
  },
  {
    id: "youtube",
    title: "YouTube",
    description: "Use a YouTube API key and the channel id you want to sync.",
    fields: ["youtubeApiKey", "youtubeChannelId"],
  },
  {
    id: "event",
    title: "NHRA event feed",
    description: "Point this to a JSON endpoint that returns the current NHRA event context.",
    fields: ["nhraEventFeedUrl"],
  },
];

function fieldTone(source: ConnectorSettingsSummaryField["source"]) {
  if (source === "interface") return "success";
  if (source === "environment") return "warning";
  return "danger";
}

export function ConnectorSettingsForm({
  initialFields,
}: ConnectorSettingsFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState(initialFields);
  const [values, setValues] = useState<Partial<ConnectorSettingsValues>>({});
  const [status, setStatus] = useState<string>("Save connector values here to avoid editing files.");
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState<ConnectorSettingsKey | null>(null);
  const [isTesting, setIsTesting] = useState<ConnectorGroupId | null>(null);
  const [testResults, setTestResults] = useState<Record<ConnectorGroupId, TestResult | undefined>>({
    meta: undefined,
    youtube: undefined,
    event: undefined,
  });

  const fieldMap = useMemo(
    () => new Map(fields.map((field) => [field.key, field])),
    [fields],
  );

  async function saveSettings() {
    setIsSaving(true);
    setStatus("Saving connector settings...");

    const response = await fetch("/api/settings/connectors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    });

    const payload = (await response.json()) as { fields?: ConnectorSettingsSummaryField[] };

    if (!response.ok || !payload.fields) {
      setStatus("Could not save connector settings.");
      setIsSaving(false);
      return;
    }

    setFields(payload.fields);
    setValues({});
    setStatus("Connector settings saved locally.");
    setIsSaving(false);
    router.refresh();
  }

  async function clearField(key: ConnectorSettingsKey) {
    setIsClearing(key);
    setStatus("Clearing saved connector value...");

    const response = await fetch("/api/settings/connectors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clearKeys: [key] }),
    });

    const payload = (await response.json()) as { fields?: ConnectorSettingsSummaryField[] };

    if (!response.ok || !payload.fields) {
      setStatus("Could not clear that connector value.");
      setIsClearing(null);
      return;
    }

    setFields(payload.fields);
    setStatus("Saved connector value cleared.");
    setIsClearing(null);
    router.refresh();
  }

  async function testConnector(groupId: ConnectorGroupId) {
    setIsTesting(groupId);
    setStatus(`Testing ${groupId} connector...`);

    const response = await fetch("/api/settings/connectors/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connector: groupId,
        values,
      }),
    });

    const payload = (await response.json()) as {
      connector?: { status?: "live" | "fallback" | "missing-config" | "error"; detail?: string };
      summary?: string;
      error?: string;
    };

    if (!response.ok || !payload.connector) {
      const message = payload.error ?? "Could not test this connector.";
      setTestResults((current) => ({
        ...current,
        [groupId]: {
          tone: "danger",
          message,
        },
      }));
      setStatus(message);
      setIsTesting(null);
      return;
    }

    const tone =
      payload.connector.status === "live"
        ? "success"
        : payload.connector.status === "error"
          ? "danger"
          : "warning";
    const message = [payload.summary, payload.connector.detail]
      .filter(Boolean)
      .join(" ");

    setTestResults((current) => ({
      ...current,
      [groupId]: {
        tone,
        message,
      },
    }));
    setStatus(`Finished testing ${groupId}.`);
    setIsTesting(null);
  }

  return (
    <section className="panel" id="connector-settings">
      <div className="section-title">
        <div>
          <h2>Connector settings</h2>
          <p>Enter credentials and feed URLs through the interface instead of editing env files.</p>
        </div>
        <span className="pill">{status}</span>
      </div>

      <div className="stack">
        {connectorGroups.map((group) => (
          <article className="list-item" key={group.id}>
            <div className="section-title">
              <div>
                <h3>{group.title}</h3>
                <p className="small">{group.description}</p>
              </div>
              <button
                className="button-secondary"
                type="button"
                disabled={isTesting === group.id}
                onClick={() => {
                  void testConnector(group.id);
                }}
              >
                {isTesting === group.id ? "Testing..." : "Test connection"}
              </button>
            </div>

            <div className="settings-grid">
              {group.fields.map((key) => {
                const field = fieldMap.get(key);

                if (!field) {
                  return null;
                }

                return (
                  <label className="settings-field" key={field.key}>
                    <span className="metric-label">{field.label}</span>
                    <input
                      className="settings-input"
                      type={field.secret ? "password" : "text"}
                      value={values[field.key] ?? ""}
                      placeholder={
                        field.configured
                          ? "Leave blank to keep current value"
                          : "Enter a value"
                      }
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                    <div className="list-meta">
                      <span
                        className="pill"
                        data-tone={fieldTone(field.source)}
                      >
                        {field.source}
                      </span>
                      <span>{field.maskedValue ?? "Not configured"}</span>
                    </div>
                    <button
                      className="button-secondary settings-clear"
                      type="button"
                      disabled={isClearing === field.key}
                      onClick={() => clearField(field.key)}
                    >
                      {isClearing === field.key ? "Clearing..." : "Clear saved value"}
                    </button>
                  </label>
                );
              })}
            </div>

            {testResults[group.id] ? (
              <div className="settings-test-result">
                <span
                  className="pill"
                  data-tone={testResults[group.id]?.tone}
                >
                  {group.title} test
                </span>
                <p className="small">{testResults[group.id]?.message}</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="hero-actions">
        <button
          className="button"
          type="button"
          disabled={isSaving}
          onClick={() => {
            void saveSettings();
          }}
        >
          {isSaving ? "Saving..." : "Save connector settings"}
        </button>
      </div>
    </section>
  );
}
