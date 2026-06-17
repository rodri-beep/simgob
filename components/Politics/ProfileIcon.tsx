"use client";

import { useState } from "react";

/**
 * Profile icon: a pixel-art sprite from `public/profiles/<id>.png`, falling back
 * to the emoji glyph when the asset is missing. `size` is the rendered height in
 * px (width scales to keep the sprite's aspect ratio); the high-res sprites are
 * downscaled smoothly.
 */
export function ProfileIcon({
  id,
  emoji,
  size,
  className,
}: {
  id: string;
  emoji: string;
  size: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span aria-hidden className={className} style={{ fontSize: size, lineHeight: 1 }}>
        {emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static pixel sprite with emoji fallback
    <img
      src={`/profiles/${id}.png`}
      alt=""
      aria-hidden
      onError={() => setFailed(true)}
      className={className}
      style={{ height: size, width: "auto", display: "block" }}
    />
  );
}
