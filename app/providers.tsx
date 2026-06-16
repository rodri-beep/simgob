"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import {
  POSTHOG_ENABLED,
  POSTHOG_HOST,
  POSTHOG_KEY,
  POSTHOG_UI_HOST,
  track,
} from "@/lib/analytics";
import { useSim } from "@/lib/store";
import { PostHogPageView } from "./PostHogPageView";

let initialized = false;

function initPostHog(): void {
  if (initialized || typeof window === "undefined" || !POSTHOG_ENABLED) return;
  initialized = true;
  posthog.init(POSTHOG_KEY as string, {
    api_host: POSTHOG_HOST,
    ui_host: POSTHOG_UI_HOST,
    capture_pageview: false, // captured manually (pathname only), see PostHogPageView
    capture_pageleave: true,
    autocapture: true,
    // Anonymous public tool: count traffic without minting a person profile per visitor.
    person_profiles: "identified_only",
  });
}

// Initialise as soon as the client bundle loads — before React renders — so the
// first $pageview is not dropped by an uninitialised client.
initPostHog();

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Building selection happens from two places (left rail + the city board);
  // subscribing to the store captures both with one hook. Only user clicks set
  // this, so there are no programmatic false positives.
  useEffect(() => {
    if (!POSTHOG_ENABLED) return;
    return useSim.subscribe((state, prev) => {
      if (state.selectedBuilding && state.selectedBuilding !== prev.selectedBuilding) {
        track("building_selected", { building: state.selectedBuilding });
      }
    });
  }, []);

  if (!POSTHOG_ENABLED) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
