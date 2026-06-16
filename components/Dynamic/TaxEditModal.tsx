"use client";

import { useSim } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { BudgetImpactBar } from "@/components/ui/BudgetImpactBar";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { IrpfControls } from "@/components/ControlPanel/IrpfControls";
import { IsControls } from "@/components/ControlPanel/IsControls";

export function TaxEditModal() {
  const editTax = useSim((s) => s.editTax);
  const setEditTax = useSim((s) => s.setEditTax);

  if (!editTax) return null;

  const title = editTax === "irpf" ? "IRPF · editar por tramo" : "Sociedades · detalle";

  return (
    <Modal title={title} onClose={() => setEditTax(null)} right={<EstimateBadge />}>
      <BudgetImpactBar />
      {editTax === "irpf" ? <IrpfControls /> : <IsControls />}
    </Modal>
  );
}
