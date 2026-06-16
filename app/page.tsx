import { TopBar } from "@/components/TopBar";
import { StatusBar } from "@/components/StatusBar";
import { LeftRail } from "@/components/LeftRail";
import { IsometricBoard } from "@/components/Board/IsometricBoard";
import { ControlPanel } from "@/components/ControlPanel/ControlPanel";
import { ProfilePanel } from "@/components/Politics/ProfilePanel";
import { DistrictModal } from "@/components/Dynamic/DistrictModal";
import { TaxEditModal } from "@/components/Dynamic/TaxEditModal";
import { RevenuePanel } from "@/components/Dynamic/RevenuePanel";
import { BudgetColumnsChart } from "@/components/Dynamic/BudgetColumnsChart";
import { TaxDetail } from "@/components/Dynamic/TaxDetail";
import { CountryTemplatePanel } from "@/components/Intl/CountryTemplatePanel";
import { Footer } from "@/components/Footer";
import { Panel } from "@/components/ui/Panel";
import { ScenarioUrlSync } from "@/components/ScenarioUrlSync";
import { IntroModal } from "@/components/Intro/IntroModal";

export default function Page() {
  return (
    <main className="max-w-[1440px] mx-auto p-2 sm:p-3 flex flex-col gap-2 sm:gap-3">
      <TopBar />
      <StatusBar />

      <div className="grid lg:grid-cols-[168px_1fr_344px] gap-2 sm:gap-3 items-start">
        <div className="hidden lg:block">
          <LeftRail />
        </div>

        <div className="min-w-0">
          <Panel
            title="Mapa del gasto público · pulsa un edificio"
            right={
              <span className="font-chrome text-[8px] normal-case">
                altura ≈ gasto (por plantas)
              </span>
            }
            bodyClassName="p-0"
          >
            <div className="h-[380px] sm:h-[460px] lg:h-[540px] overflow-hidden bevel-in">
              <IsometricBoard />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <CountryTemplatePanel />
          <ControlPanel />
          <ProfilePanel />
        </div>
      </div>

      {/* Dynamic layer — the part that reacts to the levers (spec §4 focus). */}
      <div className="grid lg:grid-cols-2 gap-2 sm:gap-3 items-start">
        <BudgetColumnsChart />
        <RevenuePanel />
      </div>
      <TaxDetail />

      <Footer />

      {/* Spending + tax editors open as modals over the city. */}
      <DistrictModal />
      <TaxEditModal />

      {/* Keeps the scenario synced with the URL for sharing (no backend). */}
      <ScenarioUrlSync />

      {/* "¿Cómo funciona?" walkthrough (auto on first visit; "?" to reopen). */}
      <IntroModal />
    </main>
  );
}
