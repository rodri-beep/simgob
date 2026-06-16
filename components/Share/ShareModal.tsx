"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSim } from "@/lib/store";
import { useSimResults } from "@/lib/useSimResults";
import { usePolitics } from "@/lib/usePolitics";
import { meta } from "@/lib/data";
import { encodeScenario } from "@/lib/share";
import { renderShareCard, canvasToBlob, type ShareFormat } from "@/lib/shareCard";
import { SITE_URL } from "@/lib/seo";
import { track } from "@/lib/analytics";

/** Brand host for the card CTA — always the canonical domain, never the (long) preview host. */
const CARD_HOST = SITE_URL.replace(/^https?:\/\//, "");
import { Modal } from "@/components/ui/Modal";
import { EstimateBadge } from "@/components/ui/EstimateBadge";

export function ShareModal() {
  const open = useSim((s) => s.shareOpen);
  const setOpen = useSim((s) => s.setShareOpen);
  const irpfScale = useSim((s) => s.irpfScale);
  const isNominalRate = useSim((s) => s.isNominalRate);
  const isMinimumRate = useSim((s) => s.isMinimumRate);
  const spendingOverrides = useSim((s) => s.spendingOverrides);

  const { totals } = useSimResults();
  const profile = usePolitics();

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedImg, setCopiedImg] = useState(false);
  const [format, setFormat] = useState<ShareFormat>("square");
  const blobRef = useRef<Blob | null>(null);

  // Share link reproducing the current scenario (same token as the URL bar).
  const link = useMemo(() => {
    if (typeof window === "undefined") return "";
    const token = encodeScenario({ irpfScale, isNominalRate, isMinimumRate, spendingOverrides });
    const url = new URL(window.location.href);
    if (token) url.searchParams.set("e", token);
    else url.searchParams.delete("e");
    return url.toString();
  }, [irpfScale, isNominalRate, isMinimumRate, spendingOverrides]);

  // Keep the latest data for the (sig-keyed) render effect without re-running it
  // on every render.
  const dataRef = useRef({ profile, totals });
  dataRef.current = { profile, totals };
  const sig = open
    ? `${profile.id}|${Math.round(totals.revenue)}|${Math.round(totals.spending)}|${Math.round(totals.balance)}`
    : "";

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let url: string | null = null;
    setImgUrl(null);
    setFailed(false);
    (async () => {
      try {
        const { profile: p, totals: t } = dataRef.current;
        const canvas = await renderShareCard({ profile: p, totals: t, gdp: meta.gdp, baseYear: meta.baseYear, host: CARD_HOST }, format);
        const blob = await canvasToBlob(canvas);
        if (cancelled) return;
        blobRef.current = blob;
        url = URL.createObjectURL(blob);
        setImgUrl(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, sig, format]);

  if (!open) return null;

  const fileName = `simgob-${profile.id}-${format}.png`;

  const download = () => {
    const b = blobRef.current;
    if (!b) return;
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
    track("share_image_downloaded", { profile: profile.id });
  };

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const nativeShare = async () => {
    const b = blobRef.current;
    if (!b) return download();
    const file = new File([b], fileName, { type: "image/png" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Mi presupuesto en SimGob",
          text: `Soy «${profile.label}» en SimGob. ¿Y tú?`,
          url: link,
        });
        track("share_image_shared", { via: "native", profile: profile.id });
      } else {
        download();
      }
    } catch {
      /* user cancelled — no-op */
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copia el enlace de tu escenario:", link);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    track("scenario_link_copied");
  };

  const canCopyImg = typeof window !== "undefined" && "ClipboardItem" in window;
  const copyImage = async () => {
    const b = blobRef.current;
    if (!b) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
      setCopiedImg(true);
      setTimeout(() => setCopiedImg(false), 1600);
      track("share_image_copied", { profile: profile.id });
    } catch {
      download();
    }
  };

  return (
    <Modal title="Comparte tu plan" onClose={() => setOpen(false)} right={<EstimateBadge />} maxWidth="max-w-xl">
      {/* Format toggle — square is the primary share; landscape suits link unfurls. */}
      <div className="flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setFormat("square")}
          data-active={format === "square"}
          className="btn-retro flex-1 text-[10px] justify-center flex"
          title="Ideal para Instagram, Stories y WhatsApp"
        >
          ◻ Cuadrada
        </button>
        <button
          type="button"
          onClick={() => setFormat("landscape")}
          data-active={format === "landscape"}
          className="btn-retro flex-1 text-[10px] justify-center flex"
          title="Ideal para X/Twitter y vistas previas de enlace"
        >
          ▭ Horizontal
        </button>
      </div>

      {/* Card preview */}
      <div className="bevel-in bg-parchment-dark/40 p-1.5 mb-3 grid place-items-center">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated PNG (blob URL); next/image can't optimize it
          <img
            src={imgUrl}
            alt={`Tarjeta de SimGob: ${profile.label}`}
            className="block w-full max-h-[58vh] object-contain"
          />
        ) : (
          <div
            className={`${
              format === "square" ? "aspect-square max-h-[58vh]" : "aspect-[1200/630]"
            } w-full grid place-items-center text-ink-soft font-chrome uppercase text-[10px]`}
          >
            {failed ? "No se pudo generar la imagen — usa el enlace ↓" : "Generando imagen…"}
          </div>
        )}
      </div>

      {/* Image actions */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} disabled={!imgUrl} className="btn-retro text-[10px] py-1 disabled:opacity-40">
          ⤓ Descargar imagen
        </button>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} disabled={!imgUrl} className="btn-retro text-[10px] py-1 bg-amber/30 disabled:opacity-40">
            ↗ Compartir…
          </button>
        )}
        {canCopyImg && (
          <button type="button" onClick={copyImage} disabled={!imgUrl} data-active={copiedImg} className="btn-retro text-[10px] py-1 disabled:opacity-40">
            {copiedImg ? "✓ Imagen copiada" : "⧉ Copiar imagen"}
          </button>
        )}
      </div>

      {/* Link */}
      <div className="mt-3 border-t border-bevel-dark/30 pt-3">
        <div className="font-chrome uppercase text-[9px] text-ink-soft mb-1">Enlace de tu escenario</div>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="panel-inset tnum font-data text-[11px] text-ink px-2 py-1 flex-1 min-w-0"
            aria-label="Enlace de tu escenario"
          />
          <button type="button" onClick={copyLink} data-active={copied} className="btn-retro text-[10px] py-1 shrink-0">
            {copied ? "✓ ¡Copiado!" : "Copiar"}
          </button>
        </div>
        <p className="text-[9px] text-ink-soft/80 leading-snug mt-2">
          Descarga la imagen para presumir de presupuesto en redes; el enlace abre SimGob con tu
          escenario para que otros lo retoquen. Estimación ilustrativa, no oficial.
        </p>
      </div>
    </Modal>
  );
}
