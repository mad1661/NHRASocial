import { NextResponse } from "next/server";

import { getCurrentUserContext } from "@/lib/auth/session";
import {
  type ConnectorSettingsKey,
  type ConnectorSettingsValues,
  getConnectorSettingsSummary,
  saveConnectorSettings,
} from "@/lib/connector-settings";

interface SavePayload {
  values?: Partial<ConnectorSettingsValues>;
  clearKeys?: ConnectorSettingsKey[];
}

export async function GET() {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const fields = await getConnectorSettingsSummary(currentUser);

  return NextResponse.json({ fields });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUserContext();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json()) as SavePayload;
  const values = payload.values ?? {};
  const clearKeys = payload.clearKeys ?? [];

  await saveConnectorSettings(currentUser, { values, clearKeys });

  return NextResponse.json({
    ok: true,
    fields: await getConnectorSettingsSummary(currentUser),
  });
}
