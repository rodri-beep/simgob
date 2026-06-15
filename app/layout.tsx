import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CrtOverlay } from "@/components/CrtOverlay";

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
  title: "Presupuestópolis — Simulación de los Presupuestos del Estado",
  description:
    "Simulador divulgativo (no oficial) de los Presupuestos Generales del Estado y los impuestos en España. Mueve el IRPF y el IS y mira el efecto sobre la recaudación y el saldo. Estimación ilustrativa.",
  applicationName: "Presupuestópolis",
  robots: { index: true, follow: true },
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
        {children}
        <CrtOverlay />
      </body>
    </html>
  );
}
