import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { appEnv, hasFirebaseAdminConfig } from "@/lib/env";

function getPrivateKey() {
  return appEnv.firebaseAdminPrivateKey?.replace(/\\n/g, "\n");
}

export function getFirebaseAdminApp() {
  if (!hasFirebaseAdminConfig()) {
    throw new Error("Firebase admin configuration is missing.");
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: cert({
      projectId: appEnv.firebaseAdminProjectId,
      clientEmail: appEnv.firebaseAdminClientEmail,
      privateKey: getPrivateKey(),
    }),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}
