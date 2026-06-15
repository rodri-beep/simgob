"use client";

import { useSim } from "@/lib/store";

export function CrtOverlay() {
  const crt = useSim((s) => s.crt);
  if (!crt) return null;
  return <div className="crt-overlay" aria-hidden />;
}
