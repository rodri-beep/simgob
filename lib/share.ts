/**
 * Encode/decode the editable scenario to/from a compact URL token, so a link
 * reproduces a scenario with no backend. Only values that differ from the
 * official base are stored, keeping the URL short. The personal "¿y a ti?"
 * salary is intentionally NOT shared (privacy).
 */
import type { IrpfScale } from "./engine/types";
import { irpfData, isData } from "./data";

export interface Scenario {
  irpfScale: IrpfScale;
  isNominalRate: number;
  isMinimumRate: number;
  spendingOverrides: Record<string, number>;
}

const baseGeneral = irpfData.scale.general.map((b) => b.rate);
const baseSavings = irpfData.scale.savings.map((b) => b.rate);

const eq = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;
const round1 = (n: number) => Math.round(n * 10) / 10;
const clampRate = (n: number) => Math.min(1, Math.max(0, n));

function toB64Url(s: string): string {
  const b =
    typeof Buffer !== "undefined"
      ? Buffer.from(s, "utf8").toString("base64")
      : btoa(s);
  return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): string {
  const b = s.replace(/-/g, "+").replace(/_/g, "/");
  return typeof Buffer !== "undefined"
    ? Buffer.from(b, "base64").toString("utf8")
    : atob(b);
}

/** Encode a scenario; returns "" when it equals the official base. */
export function encodeScenario(s: Scenario): string {
  const obj: Record<string, unknown> = {};
  if (s.irpfScale.general.some((b, i) => !eq(b.rate, baseGeneral[i]))) {
    obj.g = s.irpfScale.general.map((b) => round4(b.rate));
  }
  if (s.irpfScale.savings.some((b, i) => !eq(b.rate, baseSavings[i]))) {
    obj.s = s.irpfScale.savings.map((b) => round4(b.rate));
  }
  if (!eq(s.isNominalRate, isData.nominalRate)) obj.in = round4(s.isNominalRate);
  if (!eq(s.isMinimumRate, isData.minimumRate)) obj.im = round4(s.isMinimumRate);
  const sp = Object.entries(s.spendingOverrides);
  if (sp.length) obj.sp = Object.fromEntries(sp.map(([k, v]) => [k, round1(v)]));
  if (Object.keys(obj).length === 0) return "";
  return toB64Url(JSON.stringify(obj));
}

/** Decode a token into a partial scenario, or null if invalid. */
export function decodeScenario(token: string): Partial<Scenario> | null {
  if (!token) return null;
  try {
    const obj = JSON.parse(fromB64Url(token)) as {
      g?: unknown;
      s?: unknown;
      in?: unknown;
      im?: unknown;
      sp?: unknown;
    };
    const out: Partial<Scenario> = {};

    const g = Array.isArray(obj.g) ? (obj.g as unknown[]) : null;
    const sv = Array.isArray(obj.s) ? (obj.s as unknown[]) : null;
    if (g || sv) {
      out.irpfScale = {
        general: irpfData.scale.general.map((b, i) => ({
          threshold: b.threshold,
          rate: g && typeof g[i] === "number" ? clampRate(g[i] as number) : b.rate,
        })),
        savings: irpfData.scale.savings.map((b, i) => ({
          threshold: b.threshold,
          rate: sv && typeof sv[i] === "number" ? clampRate(sv[i] as number) : b.rate,
        })),
      };
    }
    if (typeof obj.in === "number") out.isNominalRate = clampRate(obj.in);
    if (typeof obj.im === "number") out.isMinimumRate = clampRate(obj.im);
    if (obj.sp && typeof obj.sp === "object") {
      const sp: Record<string, number> = {};
      for (const [k, v] of Object.entries(obj.sp as Record<string, unknown>)) {
        if (typeof v === "number" && isFinite(v)) sp[k] = Math.max(0, v);
      }
      out.spendingOverrides = sp;
    }
    return out;
  } catch {
    return null;
  }
}
