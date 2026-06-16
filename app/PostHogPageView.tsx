"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

/**
 * Captures a `$pageview` on route (pathname) changes for the App Router.
 *
 * We key on the pathname only and rebuild `$current_url` without the query
 * string, so the `?e=` scenario token (rewritten on every edit via
 * `history.replaceState`, see `ScenarioUrlSync`) does not inflate pageviews.
 */
export function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    posthog.capture("$pageview", {
      $current_url: window.location.origin + pathname,
    });
  }, [pathname]);

  return null;
}
