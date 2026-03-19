import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { appEnv, hasFirebaseClientConfig } from "@/lib/env";

export function getFirebaseClientApp() {
  if (!hasFirebaseClientConfig()) {
    throw new Error("Firebase client configuration is missing.");
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    apiKey: appEnv.firebaseApiKey,
    authDomain: appEnv.firebaseAuthDomain,
    projectId: appEnv.firebaseProjectId,
    storageBucket: appEnv.firebaseStorageBucket,
    messagingSenderId: appEnv.firebaseMessagingSenderId,
    appId: appEnv.firebaseAppId,
  });
}

export function getFirebaseClientAuth() {
  return getAuth(getFirebaseClientApp());
}
