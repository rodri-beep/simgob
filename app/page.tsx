import { TopBar } from "@/components/TopBar";
import { StatusBar } from "@/components/StatusBar";
import { LeftRail } from "@/components/LeftRail";
import { IsometricBoard } from "@/components/Board/IsometricBoard";
import { ProfilePanel } from "@/components/Politics/ProfilePanel";
import { PLPanel } from "@/components/Economy/PLPanel";
import { DistrictModal } from "@/components/Dynamic/DistrictModal";
import { ImpuestosModal } from "@/components/Impuestos/ImpuestosModal";
import { ShareModal } from "@/components/Share/ShareModal";
import { RevenuePanel } from "@/components/Dynamic/RevenuePanel";
import { BudgetColumnsChart } from "@/components/Dynamic/BudgetColumnsChart";
import { TaxDetail } from "@/components/Dynamic/TaxDetail";
import { CountryTemplatePanel } from "@/components/Intl/CountryTemplatePanel";
import { Footer } from "@/components/Footer";
import { Panel } from "@/components/ui/Panel";
import { ScenarioUrlSync } from "@/components/ScenarioUrlSync";
import { IntroModal } from "@/components/Intro/IntroModal";
import { MobileApp } from "@/components/Mobile/MobileApp";

export default function Page() {
  return (
    <>
      {/* Mobile (< lg): the phone-first app. Same store/engine as the desktop. */}
      <div className="lg:hidden">
        <MobileApp />
      </div>

      {/* Desktop (≥ lg): the original layout, untouched. */}
      <main className="hidden lg:flex max-w-[1440px] mx-auto p-2 sm:p-3 flex-col gap-2 sm:gap-3">
        <TopBar />
        <StatusBar />

        <div className="grid lg:grid-cols-[190px_1fr_330px] gap-2 sm:gap-3 items-start">
          {/* Left: navigation menu. */}
          <LeftRail />

          {/* Center: the city. */}
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
              <div className="h-[380px] sm:h-[460px] lg:h-[560px] overflow-hidden bevel-in">
                <IsometricBoard />
              </div>
            </Panel>
          </div>

          {/* Right: political profile (top) + P/L summary. */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <ProfilePanel />
            <PLPanel />
          </div>
        </div>

        {/* Country templates — full-width module under the map. */}
        <CountryTemplatePanel />

        {/* Detail (collapsed by default to keep the main screen calm). */}
        <div className="grid lg:grid-cols-2 gap-2 sm:gap-3 items-start">
          <BudgetColumnsChart />
          <RevenuePanel />
        </div>
        <TaxDetail />

        <Footer />

        {/* "¿Cómo funciona?" walkthrough — desktop copy/layout (auto on first
            visit; "?" to reopen). The phone has its own MobileIntro. */}
        <IntroModal />
      </main>

      {/* Modals over the app — shared by both layouts. On mobile only the share
          card is triggered; the district/taxes modals stay dormant (mobile uses
          its own bottom sheet), and onboarding is handled by MobileIntro. */}
      <DistrictModal />
      <ImpuestosModal />
      <ShareModal />

      {/* Keeps the scenario synced with the URL for sharing (no backend). */}
      <ScenarioUrlSync />
    </>
  );
}
