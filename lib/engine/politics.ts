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
export const SOCIAL_POLICY_IDS = ["pensiones", "desempleo", "social_otras", "salud", "educacion", "vivienda"];
export const SECURITY_POLICY_IDS = ["defensa", "orden"];

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
  centrista: { id: "centrista", label: "Centrista", emoji: "⚖️", blurb: "Sin ideas, de centro… comercial." },
  socialista: { id: "socialista", label: "Socialista", emoji: "🌹", blurb: "Contentando a las charos." },
  comunista: { id: "comunista", label: "Comunista peligroso/a", emoji: "☭", blurb: "A gastar el dinero del resto." },
  liberal: { id: "liberal", label: "Liberal", emoji: "💼", blurb: "Te crees que tienes la solución porque has visto a Miguel Anxo Bastos en TikTok." },
  conservador: { id: "conservador", label: "Conservador/a", emoji: "🎩", blurb: "Privatizando un poquito por aquí me bajo los impuestos por allí." },
  turbofacha: { id: "turbofacha", label: "Turbofacha", emoji: "🦅", blurb: "Menos chiringuitos y más Guardia Civil." },
  populista: { id: "populista", label: "Cuñao de barra de bar", emoji: "🍺", blurb: "Solucionando el mundo con unos carajillos." },
};

export function classifyPolitics(i: PoliticsInput): PoliticsResult {
  const tax = clamp(i.taxDelta / 20000);
  const prog = clamp(i.topRateDelta / 0.1);
  const social = clamp(i.socialDelta / 20000);
  const security = clamp(i.securityDelta / 8000);
  const stateSize = clamp(i.totalSpendDelta / 40000);
  const deficitDelta = i.balance - i.baseBalance;
  // Spain's status quo is already a sizeable welfare state with a deficit, so
  // the real "centre" is left of zero: the untouched base reads as Socialista.
  // You must trim toward balance to be Centrista, and cut hard to be liberal.
  // "Comunista peligroso" is reserved for genuinely extreme settings — taxing/
  // spending merely like France or Germany stays Socialista.
  const BASELINE_LEANING = 0.55;
  const leaning = BASELINE_LEANING + tax + 0.7 * prog + social; // >0 = izquierda

  const reasons = buildReasons({ tax, prog, social, security, stateSize, deficitDelta });
  if (reasons.length === 0) reasons.push("España ya parte de un Estado social amplio");
  const withReasons = (key: string): PoliticsResult => ({ ...PROFILES[key], reasons });

  // Far-right / populist flavors take priority over the generic axis.
  if (security > 0.35 && social < -0.2) return withReasons("turbofacha");
  if (tax < -0.3 && deficitDelta < -20000) return withReasons("populista");

  // Left axis (baseline already sits in "socialista").
  if (leaning >= 3.2) return withReasons("comunista");
  if (leaning >= 0.3) return withReasons("socialista");

  // Right axis.
  if (leaning <= -0.5) {
    if (tax < -0.35 && stateSize < -0.35) return withReasons("liberal");
    return withReasons("conservador");
  }

  return withReasons("centrista");
}
