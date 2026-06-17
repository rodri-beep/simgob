"use client";

import { useEffect } from "react";
import { useSim } from "@/lib/store";
import { encodeScenario, decodeScenario } from "@/lib/share";
import { loadCountryScenario } from "@/lib/firstMoves";

/** Keeps the scenario in sync with the URL (`?e=`), with no backend. */
export function ScenarioUrlSync() {
  // On mount: hydrate from the URL. `?e=` (a full scenario) wins; otherwise a
  // `?modelo=` deep link (from the "España vs país" share) loads that country.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("e");
    if (token) {
      const sc = decodeScenario(token);
      if (sc) useSim.getState().applyScenario(sc);
      return;
    }
    const modelo = params.get("modelo");
    if (modelo) loadCountryScenario(modelo);
  }, []);

  // On change: write a debounced token to the URL (replaceState, no history spam).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = new URLSearchParams(window.location.search).get("e") ?? "";

    const unsub = useSim.subscribe((state) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const token = encodeScenario({
          irpfScale: state.irpfScale,
          isNominalRate: state.isNominalRate,
          isMinimumRate: state.isMinimumRate,
          spendingOverrides: state.spendingOverrides,
        });
        if (token === last) return;
        last = token;
        const url = new URL(window.location.href);
        if (token) url.searchParams.set("e", token);
        else url.searchParams.delete("e");
        window.history.replaceState(null, "", url.toString());
      }, 300);
    });

    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, []);

  return null;
}
