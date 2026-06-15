import { TopBar } from "@/components/TopBar";
import { StatusBar } from "@/components/StatusBar";
import { LeftRail } from "@/components/LeftRail";
import { IsometricBoard } from "@/components/Board/IsometricBoard";
import { ControlPanel } from "@/components/ControlPanel/ControlPanel";
import { DistrictPanel } from "@/components/Dynamic/DistrictPanel";
import { RevenuePanel } from "@/components/Dynamic/RevenuePanel";
import { TaxDetail } from "@/components/Dynamic/TaxDetail";
import { Footer } from "@/components/Footer";
import { Panel } from "@/components/ui/Panel";

export default function Page() {
  return (
    <main className="max-w-[1440px] mx-auto p-2 sm:p-3 flex flex-col gap-2 sm:gap-3">
      <TopBar />
      <StatusBar />

      <div className="grid lg:grid-cols-[168px_1fr_344px] gap-2 sm:gap-3 items-start">
        <div className="hidden lg:block">
          <LeftRail />
        </div>

        <div className="flex flex-col gap-2 sm:gap-3 min-w-0">
          <Panel
            title="Mapa del gasto público · pulsa un edificio"
            right={
              <span className="font-chrome text-[8px] normal-case">
                tamaños orientativos, no a escala
              </span>
            }
            bodyClassName="p-0"
          >
            <div className="h-[340px] sm:h-[420px] lg:h-[480px] overflow-hidden bevel-in">
              <IsometricBoard />
            </div>
          </Panel>
          <DistrictPanel />
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <ControlPanel />
        </div>
      </div>

      {/* Dynamic layer — the part that reacts to the levers (spec §4 focus). */}
      <div className="grid lg:grid-cols-2 gap-2 sm:gap-3 items-start">
        <RevenuePanel />
        <TaxDetail />
      </div>

      <Footer />
    </main>
  );
}
