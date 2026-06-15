/**
 * Satirical "perfil político" classifier — reads the user's own scenario back to
 * them with a tongue-in-cheek label. Pure and testable. Tone: self-applied
 * humour (it tags YOUR choices), never targets anyone.
 */

export interface PoliticsInput {
  /** National tax change vs base, in M€ (>0 = raising taxes). */
  taxDelta: number;
  /** Avg change in the top IRPF marginal rates (fraction; >0 = raised the top). */
  topRateDelta: number;
  /** Change in social spending vs base, in M€ (>0 = more social). */
  socialDelta: number;
  /** Change in defense + security + justice, in M€ (>0 = more). */
  securityDelta: number;
  /** Change in total spending vs base, in M€ (>0 = bigger state). */
  totalSpendDelta: number;
  /** Current and base balance, in M€ (for the deficit signal). */
  balance: number;
  baseBalance: number;
}

export interface PoliticsResult {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  /** Short human reasons (the dominant signals). */
  reasons: string[];
}

/** Spending policy ids considered "social" / "security" for the leaning. */
export const SOCIAL_POLICY_IDS = ["p21", "p31", "p32", "p25", "p22", "p23", "p24", "p26"];
export const SECURITY_POLICY_IDS = ["p12", "p13", "p11"];

const clamp = (x: number, lo = -1.5, hi = 1.5) => Math.max(lo, Math.min(hi, x));

function buildReasons(s: {
  tax: number;
  prog: number;
  social: number;
  security: number;
  stateSize: number;
  deficitDelta: number;
}): string[] {
  const r: { w: number; text: string }[] = [];
  if (s.tax > 0.1) r.push({ w: s.tax, text: "Subes impuestos" });
  else if (s.tax < -0.1) r.push({ w: -s.tax, text: "Bajas impuestos" });
  if (s.prog > 0.1) r.push({ w: s.prog, text: "Más a las rentas altas" });
  else if (s.prog < -0.1) r.push({ w: -s.prog, text: "Alivias a las rentas altas" });
  if (s.social > 0.1) r.push({ w: s.social, text: "Más gasto social" });
  else if (s.social < -0.1) r.push({ w: -s.social, text: "Recortas lo social" });
  if (s.security > 0.2) r.push({ w: s.security, text: "Refuerzas Defensa/Seguridad" });
  else if (s.security < -0.2) r.push({ w: -s.security, text: "Recortas Defensa/Seguridad" });
  if (s.stateSize > 0.15) r.push({ w: s.stateSize * 0.6, text: "Estado más grande" });
  else if (s.stateSize < -0.15) r.push({ w: -s.stateSize * 0.6, text: "Estado más pequeño" });
  if (s.deficitDelta > 15000) r.push({ w: 0.5, text: "Reduces el déficit" });
  else if (s.deficitDelta < -15000) r.push({ w: 0.5, text: "Disparas el déficit" });
  return r.sort((a, b) => b.w - a.w).slice(0, 3).map((x) => x.text);
}

const PROFILES: Record<string, Omit<PoliticsResult, "reasons">> = {
  centrista: { id: "centrista", label: "Centrista", emoji: "⚖️", blurb: "Ni fu ni fa: dejas casi todo como está." },
  socialista: { id: "socialista", label: "Socialista", emoji: "🌹", blurb: "Más Estado y más para quien menos tiene." },
  comunista: { id: "comunista", label: "Comunista peligroso/a", emoji: "☭", blurb: "¡A exprimir a las rentas altas y gasto social a tope!" },
  liberal: { id: "liberal", label: "Liberal", emoji: "💼", blurb: "Menos impuestos y menos Estado: que lo arregle el mercado." },
  conservador: { id: "conservador", label: "Conservador/a", emoji: "🎩", blurb: "Bajar impuestos con prudencia y mano firme." },
  turbofacha: { id: "turbofacha", label: "Turbofacha", emoji: "🦅", blurb: "Más cuarteles y menos subsidios." },
  populista: { id: "populista", label: "Populista de barra de bar", emoji: "🤡", blurb: "Prometes de todo y que pague otro: déficit por las nubes." },
};

export function classifyPolitics(i: PoliticsInput): PoliticsResult {
  const tax = clamp(i.taxDelta / 20000);
  const prog = clamp(i.topRateDelta / 0.1);
  const social = clamp(i.socialDelta / 20000);
  const security = clamp(i.securityDelta / 8000);
  const stateSize = clamp(i.totalSpendDelta / 40000);
  const deficitDelta = i.balance - i.baseBalance;
  const leaning = tax + 0.7 * prog + social; // >0 = izquierda

  const reasons = buildReasons({ tax, prog, social, security, stateSize, deficitDelta });
  const withReasons = (key: string): PoliticsResult => ({ ...PROFILES[key], reasons });

  // Near the official base → centrist.
  if (
    Math.abs(tax) < 0.1 &&
    Math.abs(social) < 0.1 &&
    Math.abs(prog) < 0.12 &&
    Math.abs(security) < 0.25 &&
    Math.abs(stateSize) < 0.1
  ) {
    return withReasons("centrista");
  }

  // Far-right / populist flavors take priority over the generic axis.
  if (security > 0.35 && social < -0.2) return withReasons("turbofacha");
  if (tax < -0.3 && deficitDelta < -20000) return withReasons("populista");

  // Left axis.
  if (leaning >= 1.2) return withReasons("comunista");
  if (leaning >= 0.3) return withReasons("socialista");

  // Right axis.
  if (leaning <= -0.3) {
    if (tax < -0.2 && stateSize < -0.2) return withReasons("liberal");
    return withReasons("conservador");
  }

  return withReasons("centrista");
}
