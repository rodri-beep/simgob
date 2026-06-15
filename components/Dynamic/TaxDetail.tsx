"use client";

import { useSim } from "@/lib/store";
import { IrpfDetail } from "./IrpfDetail";
import { IsDetail } from "./IsDetail";

export function TaxDetail() {
  const active = useSim((s) => s.activeRevenue);
  return active === "irpf" ? <IrpfDetail /> : <IsDetail />;
}
