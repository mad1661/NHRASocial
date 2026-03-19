import { FieldValue } from "firebase-admin/firestore";

import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export interface ProvisionedUserContext {
  uid: string;
  email: string;
  displayName: string;
  workspaceId: string;
  workspaceName: string;
}

function deriveWorkspaceName(email: string, displayName?: string | null) {
  if (displayName && displayName.trim().length > 0) {
    return `${displayName}'s workspace`;
  }

  const localPart = email.split("@")[0] ?? "NHRA";
  return `${localPart}'s workspace`;
}

export async function provisionUserWorkspace(input: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<ProvisionedUserContext> {
  const email = input.email ?? "unknown@example.com";
  const displayName = input.displayName ?? email.split("@")[0] ?? "NHRA user";
  const workspaceId = input.uid;
  const workspaceName = deriveWorkspaceName(email, input.displayName);
  const db = getFirebaseAdminDb();

  await db.collection("users").doc(input.uid).set(
    {
      uid: input.uid,
      email,
      displayName,
      defaultWorkspaceId: workspaceId,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await db.collection("workspaces").doc(workspaceId).set(
    {
      id: workspaceId,
      kind: "personal",
      ownerUid: input.uid,
      name: workspaceName,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await db
    .collection("workspaces")
    .doc(workspaceId)
    .collection("members")
    .doc(input.uid)
    .set(
      {
        uid: input.uid,
        email,
        displayName,
        role: "owner",
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  return {
    uid: input.uid,
    email,
    displayName,
    workspaceId,
    workspaceName,
  };
}

export async function getUserWorkspaceContext(uid: string) {
  const db = getFirebaseAdminDb();
  const userSnapshot = await db.collection("users").doc(uid).get();

  if (!userSnapshot.exists) {
    return null;
  }

  const userData = userSnapshot.data();
  const workspaceId =
    typeof userData?.defaultWorkspaceId === "string" ? userData.defaultWorkspaceId : uid;
  const workspaceSnapshot = await db.collection("workspaces").doc(workspaceId).get();
  const workspaceData = workspaceSnapshot.data();

  return {
    uid,
    email: typeof userData?.email === "string" ? userData.email : "unknown@example.com",
    displayName:
      typeof userData?.displayName === "string" ? userData.displayName : "NHRA user",
    workspaceId,
    workspaceName:
      typeof workspaceData?.name === "string"
        ? workspaceData.name
        : "Personal workspace",
  } satisfies ProvisionedUserContext;
}
