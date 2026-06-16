"use client";

import { useState } from "react";
import { useSim } from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { BudgetImpactBar } from "@/components/ui/BudgetImpactBar";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { IrpfSimple } from "@/components/ControlPanel/IrpfSimple";
import { IsSimple } from "@/components/ControlPanel/IsSimple";
import { IrpfControls } from "@/components/ControlPanel/IrpfControls";
import { IsControls } from "@/components/ControlPanel/IsControls";

export function ImpuestosModal() {
  const open = useSim((s) => s.impuestosOpen);
  const setOpen = useSim((s) => s.setImpuestosOpen);
  const active = useSim((s) => s.activeRevenue);
  const setActive = useSim((s) => s.setActiveRevenue);
  const [detail, setDetail] = useState(false);

  if (!open) return null;

  return (
    <Modal title="Impuestos" onClose={() => setOpen(false)} right={<EstimateBadge />}>
      <BudgetImpactBar />

      <div className="flex gap-1 mb-2">
        <button
          type="button"
          className="btn-retro flex-1 text-[10px] justify-center flex"
          data-active={active === "irpf"}
          onClick={() => setActive("irpf")}
        >
          IRPF
        </button>
        <button
          type="button"
          className="btn-retro flex-1 text-[10px] justify-center flex"
          data-active={active === "is"}
          onClick={() => setActive("is")}
        >
          Sociedades
        </button>
      </div>

      {active === "irpf" ? <IrpfSimple /> : <IsSimple />}

      <button
        type="button"
        className="btn-retro w-full mt-3 text-[10px] justify-center flex"
        data-active={detail}
        onClick={() => setDetail((v) => !v)}
      >
        {detail ? "▾ Ocultar detalle por tramo" : "▸ Editar por tramo / detalle"}
      </button>
      {detail && (
        <div className="mt-2 border-t border-bevel-dark/30 pt-2">
          {active === "irpf" ? <IrpfControls /> : <IsControls />}
        </div>
      )}
    </Modal>
  );
}
