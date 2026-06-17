/**
 * Tiny inline-SVG country flags. Flag *emoji* don't render on Windows (and some
 * browsers) — they fall back to letter pairs (ES, SE…) or tofu — so we draw the
 * flags ourselves. Recognisable, not pedantic; sized by height (3:2 ratio).
 */
import type { ReactNode } from "react";

const VB = "0 0 30 20";

function cross(bg: string, fg: string): ReactNode {
  // Nordic cross, offset toward the hoist.
  return (
    <>
      <rect x="0" y="0" width="30" height="20" fill={bg} />
      <rect x="9" y="0" width="4" height="20" fill={fg} />
      <rect x="0" y="8" width="30" height="4" fill={fg} />
    </>
  );
}

function vstripes(a: string, b: string, c: string): ReactNode {
  return (
    <>
      <rect x="0" y="0" width="10" height="20" fill={a} />
      <rect x="10" y="0" width="10" height="20" fill={b} />
      <rect x="20" y="0" width="10" height="20" fill={c} />
    </>
  );
}

function euStars(): ReactNode {
  const stars = Array.from({ length: 12 }, (_, k) => {
    const ang = (k * Math.PI) / 6;
    return <circle key={k} cx={15 + 6 * Math.sin(ang)} cy={10 - 6 * Math.cos(ang)} r="0.9" fill="#ffcc00" />;
  });
  return (
    <>
      <rect x="0" y="0" width="30" height="20" fill="#003399" />
      {stars}
    </>
  );
}

function usFlag(): ReactNode {
  const stripes = Array.from({ length: 6 }, (_, i) => (
    <rect key={i} x="0" y={(2 * i + 1) * (20 / 13)} width="30" height={20 / 13} fill="#fff" />
  ));
  const stars = [
    [2.5, 2],
    [5.5, 2],
    [8.5, 2],
    [4, 4],
    [7, 4],
    [2.5, 6],
    [5.5, 6],
    [8.5, 6],
  ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.55" fill="#fff" />);
  return (
    <>
      <rect x="0" y="0" width="30" height="20" fill="#b22234" />
      {stripes}
      <rect x="0" y="0" width="12" height={7 * (20 / 13)} fill="#3c3b6e" />
      {stars}
    </>
  );
}

const FLAGS: Record<string, ReactNode> = {
  es: (
    <>
      <rect x="0" y="0" width="30" height="20" fill="#c60b1e" />
      <rect x="0" y="5" width="30" height="10" fill="#ffc400" />
    </>
  ),
  suecia: cross("#006aa7", "#fecc00"),
  dinamarca: cross("#c8102e", "#ffffff"),
  alemania: (
    <>
      <rect x="0" y="0" width="30" height="6.67" fill="#000000" />
      <rect x="0" y="6.67" width="30" height="6.67" fill="#dd0000" />
      <rect x="0" y="13.33" width="30" height="6.67" fill="#ffce00" />
    </>
  ),
  francia: vstripes("#0055a4", "#ffffff", "#ef4135"),
  italia: vstripes("#009246", "#ffffff", "#ce2b37"),
  ue27: euStars(),
  eeuu: usFlag(),
};

export function Flag({
  country,
  size = 13,
  className,
}: {
  country: string;
  size?: number;
  className?: string;
}) {
  const inner = FLAGS[country];
  if (!inner) return null;
  return (
    <svg
      viewBox={VB}
      width={Math.round(size * 1.5)}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flex: "none" }}
      aria-hidden
    >
      {inner}
      <rect x="0" y="0" width="30" height="20" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
    </svg>
  );
}
