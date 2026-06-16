import type { BuildingId } from "./engine/types";

/** Top-face color per function, shared by the board and the nav rail (COFOG palette). */
export const BUILDING_COLORS: Record<BuildingId, string> = {
  social: "#cf9a52",
  salud: "#c75b4e",
  educacion: "#d68a3a",
  general: "#cdbf90",
  economicos: "#9a9078",
  orden: "#8a9656",
  defensa: "#5e6a45",
  cultura: "#d4b24a",
  medioambiente: "#4f9a6a",
  vivienda: "#7fb0c4",
};
