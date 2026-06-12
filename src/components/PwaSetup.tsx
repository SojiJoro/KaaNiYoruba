"use client";

import { useEffect } from "react";

/** Registers the service worker that makes Kàá installable and offline-capable. */
export function PwaSetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is progressive enhancement; ignore registration failures.
      });
    }
  }, []);
  return null;
}
