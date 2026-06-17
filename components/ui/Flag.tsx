/**
 * Tiny inline-SVG country flags. Flag *emoji* don't render on Windows (and some
 * browsers), so we draw the flags ourselves. Shapes live in lib/flags so the
 * canvas share cards can reuse them. Sized by height (3:2 ratio).
 */
import { FLAG_INNER } from "@/lib/flags";

const BORDER = '<rect width="30" height="20" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>';

export function Flag({
  country,
  size = 13,
  className,
}: {
  country: string;
  size?: number;
  className?: string;
}) {
  const inner = FLAG_INNER[country];
  if (!inner) return null;
  return (
    <svg
      viewBox="0 0 30 20"
      width={Math.round(size * 1.5)}
      height={size}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flex: "none" }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: inner + BORDER }}
    />
  );
}
