"use client";

import { useSim } from "@/lib/store";
import { Panel } from "@/components/ui/Panel";
import { EstimateBadge } from "@/components/ui/EstimateBadge";
import { IrpfSimple } from "./IrpfSimple";
import { IsSimple } from "./IsSimple";

export function ControlPanel() {
  const active = useSim((s) => s.activeRevenue);
  const setActive = useSim((s) => s.setActiveRevenue);

  return (
    <Panel
      tone="olive"
      title="Impuestos · palancas"
      right={<EstimateBadge />}
      bodyClassName="p-0"
    >
      <div className="flex gap-1 p-2 pb-0">
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
      <div className="p-2">{active === "irpf" ? <IrpfSimple /> : <IsSimple />}</div>
    </Panel>
  );
}
