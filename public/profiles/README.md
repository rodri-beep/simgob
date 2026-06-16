# Profile icons

Pixel-art sprites for the political profiles. Drop a PNG here named exactly
`<profile-id>.png` and it replaces the emoji on the share card hero and on-site
(profile panel + mobile summary). Missing files fall back to the emoji glyph, so
you can add them one at a time.

| Profile (label)        | id            | file               | emoji |
| ---------------------- | ------------- | ------------------ | ----- |
| Centrista              | `centrista`   | `centrista.png`    | ⚖️    |
| Socialista             | `socialista`  | `socialista.png`   | 🌹    |
| Comunista peligroso/a  | `comunista`   | `comunista.png`    | ☭     |
| Liberal                | `liberal`     | `liberal.png`      | 💼    |
| Conservador/a          | `conservador` | `conservador.png`  | 🎩    |
| Turbofacha             | `turbofacha`  | `turbofacha.png`   | 🦅    |
| Cuñao                  | `populista`   | `populista.png`    | 🍺    |

## Format

- **PNG with a transparent background** (no black/coloured box — it sits on the
  parchment card and on light panels).
- Roughly **square** canvas with consistent padding / visual weight across all
  seven, so they read as a set.
- True pixel art — scaled with nearest-neighbour (crisp edges) to ~168 px on the
  card hero and ~40 px on-site, so a modest native resolution is fine.

Wiring: `lib/shareCard.ts` (canvas) and `components/Politics/ProfileIcon.tsx`
(site) load `/profiles/<id>.png`. No code change is needed when you add a file.
