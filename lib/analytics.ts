import posthog from "posthog-js";

/**
 * SimGob's PostHog project API key (EU cloud). This is a *write-only* project
 * key — it can ingest events but cannot read data — so it is meant to live in
 * client code and is safe to ship. Forks/self-hosters can point at their own
 * project with `NEXT_PUBLIC_POSTHOG_KEY`, or set it to "" to fully disable.
 */
const DEFAULT_POSTHOG_KEY = "phc_kjJBVJuTyTo92iy6XtSMc3C9WhStWh5GZK22cbHetzFY";

export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? DEFAULT_POSTHOG_KEY;

/**
 * Ingestion host. Defaults to the first-party reverse proxy (`/ingest`, see
 * `next.config.mjs`), which keeps requests same-origin and so dodges most
 * ad-blockers. For a purely static deploy without rewrites, set
 * `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.
 */
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest";

/** PostHog app host, used for "view in PostHog" links / the toolbar. */
export const POSTHOG_UI_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? "https://eu.posthog.com";

/**
 * Analytics run in production only (built site / Vercel), so `next dev` and
 * tests never send events. Disabled entirely when the key is empty.
 */
export const POSTHOG_ENABLED =
  Boolean(POSTHOG_KEY) && process.env.NODE_ENV === "production";

type Props = Record<string, unknown>;

/** Capture a custom event. No-op when PostHog is not configured. */
export function track(event: string, properties?: Props): void {
  if (!POSTHOG_ENABLED) return;
  posthog.capture(event, properties);
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Like {@link track}, but coalesces a burst of calls sharing the same `key`
 * into a single event fired `delay` ms after the last call. Use for noisy
 * inputs such as sliders, where one event per drag is enough. Properties from
 * the most recent call win.
 */
export function trackDebounced(
  key: string,
  event: string,
  properties?: Props,
  delay = 700,
): void {
  if (!POSTHOG_ENABLED) return;
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      posthog.capture(event, properties);
    }, delay),
  );
}
