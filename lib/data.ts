import metaJson from "@/data/meta.json";
import revenueJson from "@/data/revenue.json";
import spendingJson from "@/data/spending.json";
import irpfJson from "@/data/irpf.json";
import isJson from "@/data/is.json";
import buildingsJson from "@/data/buildings.json";
import humanJson from "@/data/human.json";

import type {
  DatasetMeta,
  RevenueLine,
  SpendingPolicy,
  IrpfData,
  IsData,
  BoardBuilding,
  HumanData,
  BeneficiaryAnchor,
} from "./engine/types";

export const meta = metaJson as unknown as DatasetMeta & { provisional?: boolean };
export const revenueLines = (revenueJson.lines as unknown) as RevenueLine[];
export const spendingPolicies = (spendingJson.policies as unknown) as SpendingPolicy[];
export const irpfData = irpfJson as unknown as IrpfData;
export const isData = isJson as unknown as IsData;
export const buildings = (buildingsJson.buildings as unknown) as BoardBuilding[];
export const human = humanJson as unknown as HumanData;

/** Beneficiary anchor for a spending policy, or undefined (→ universal anchors). */
export function anchorFor(policyId: string): BeneficiaryAnchor | undefined {
  return human.anchors[policyId];
}

export const isProvisional = Boolean((metaJson as { provisional?: boolean }).provisional);

/** Lookup a building's metadata by id. */
export function buildingById(id: string): BoardBuilding | undefined {
  return buildings.find((b) => b.id === id);
}

/** Spending policies grouped under a building, sorted by amount desc. */
export function spendingForBuilding(buildingId: string): SpendingPolicy[] {
  return spendingPolicies
    .filter((p) => p.building === buildingId)
    .sort((a, b) => b.amount - a.amount);
}

/** Total spending attributed to a building. */
export function buildingTotal(buildingId: string): number {
  return spendingForBuilding(buildingId).reduce((a, p) => a + p.amount, 0);
}
