"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSim } from "@/lib/store";
import { aappBaseline, countryModels, meta } from "@/lib/data";
import { spainResult, applyCountry } from "@/lib/intl";
import { renderCompareCard, canvasToBlob } from "@/lib/compareCard";
import { SITE_URL } from "@/lib/seo";
import { track } from "@/lib/analytics";
import { Modal } from "@/components/ui/Modal";
import { EstimateBadge } from "@/components/ui/EstimateBadge";

const CARD_HOST = SITE_URL.replace(/^https?:\/\//, "");

export function CompareModal() {
  const compareCountry = useSim((s) => s.compareCountry);
  const setCompareCountry = useSim((s) => s.setCompareCountry);

  const country = useMemo(
    () => countryModels.find((c) => c.id === compareCountry) ?? null,
    [compareCountry],
  );

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedImg, setCopiedImg] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  const link = useMemo(() => {
    if (typeof window === "undefined" || !country) return "";
    const url = new URL(window.location.origin + "/");
    url.searchParams.set("modelo", country.id);
    return url.toString();
  }, [country]);

  useEffect(() => {
    if (!country) return;
    let cancelled = false;
    let url: string | null = null;
    setImgUrl(null);
    setFailed(false);
    (async () => {
      try {
        const canvas = await renderCompareCard({
          countryId: country.id,
          countryLabel: country.label,
          spain: spainResult(aappBaseline),
          country: applyCountry(aappBaseline, country),
          gdp: aappBaseline.gdp,
          baseYear: meta.baseYear,
          host: CARD_HOST,
        });
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
  }, [country]);

  if (!country) return null;

  const fileName = `simgob-espana-vs-${country.id}.png`;
  const close = () => setCompareCountry(null);

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
    track("compare_image_downloaded", { country: country.id });
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
          title: `España vs ${country.label}`,
          text: `¿La España de ${country.label}? Compáralo en SimGob.`,
          url: link,
        });
        track("compare_image_shared", { via: "native", country: country.id });
      } else {
        download();
      }
    } catch {
      /* cancelled */
    }
  };

  const canCopyImg = typeof window !== "undefined" && "ClipboardItem" in window;
  const copyImage = async () => {
    const b = blobRef.current;
    if (!b) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
      setCopiedImg(true);
      setTimeout(() => setCopiedImg(false), 1600);
      track("compare_image_copied", { country: country.id });
    } catch {
      download();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copia el enlace:", link);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    track("compare_link_copied", { country: country.id });
  };

  return (
    <Modal title={`España vs ${country.label}`} onClose={close} right={<EstimateBadge />} maxWidth="max-w-md">
      <div className="bevel-in bg-parchment-dark/40 p-1.5 mb-3 grid place-items-center">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated PNG (blob URL)
          <img
            src={imgUrl}
            alt={`Comparativa España vs ${country.label}`}
            className="block w-full max-h-[58vh] object-contain"
          />
        ) : (
          <div className="aspect-square max-h-[58vh] w-full grid place-items-center text-ink-soft font-chrome uppercase text-[10px]">
            {failed ? "No se pudo generar la imagen — usa el enlace ↓" : "Generando imagen…"}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} disabled={!imgUrl} className="btn-retro text-[10px] py-1 disabled:opacity-40">
          ⤓ Descargar
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
        <button type="button" onClick={copyLink} data-active={copied} className="btn-retro text-[10px] py-1">
          {copied ? "✓ Enlace copiado" : "Copiar enlace"}
        </button>
      </div>
      <p className="text-[9px] text-ink-soft/80 leading-snug mt-2">
        Mismo gasto total que España, repartido con la estructura de {country.label} y su nivel de
        impuestos. Estimación ilustrativa, no oficial.
      </p>
    </Modal>
  );
}
