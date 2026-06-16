import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PostHogProvider } from "./providers";
import { JsonLd } from "@/components/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  ORG_NAME,
  siteJsonLd,
} from "@/lib/seo";

const pixel = localFont({
  src: "../public/fonts/PressStart2P-Regular.ttf",
  variable: "--font-pixel",
  display: "swap",
});

const chrome = localFont({
  src: [
    { path: "../public/fonts/Silkscreen-Regular.ttf", weight: "400" },
    { path: "../public/fonts/Silkscreen-Bold.ttf", weight: "700" },
  ],
  variable: "--font-chrome",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — SimGob",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: ORG_NAME, url: SITE_URL }],
  creator: ORG_NAME,
  publisher: ORG_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "es_ES",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: "#194c4c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${pixel.variable} ${chrome.variable}`}>
      <body>
        <JsonLd data={siteJsonLd()} />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
