import type { BuildingId } from "./engine/types";

/** Top-face color per district, shared by the board and the nav rail. */
export const BUILDING_COLORS: Record<BuildingId, string> = {
  pensiones: "#cf9a52",
  hacienda: "#cdbf90",
  desempleo: "#8a9656",
  deuda: "#9a9078",
  defensa: "#5e6a45",
  infraestructuras: "#d4b24a",
  sanidad: "#c75b4e",
  educacion: "#d68a3a",
  transicion: "#4f9a6a",
  moncloa: "#e0d4ab",
  otros: "#8fa0a6",
};
