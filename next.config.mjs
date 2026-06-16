/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Reverse-proxy PostHog (EU cloud) so analytics requests are first-party and
  // survive most ad-blockers. The client points at `/ingest` (see lib/analytics.ts).
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // Needed so the proxied /ingest routes aren't altered by trailing-slash handling.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
