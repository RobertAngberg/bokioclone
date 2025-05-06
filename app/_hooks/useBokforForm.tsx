"use client";

import { useState, useEffect, useCallback } from "react";

type Options = {
  /** vilka fält som måste fyllas i för att knappen ska aktiveras */
  keys: ("total" | "extra")[];
  /** förifyllt datum (ISO yyyy‑mm‑dd) om det redan finns */
  defaultDate?: string | null;
  /**
   * anropas av LaddaUppFil när ett belopp hittas i PDF / bild.
   * v = null om inget belopp kunde tolkas.
   * setTotal = setter för totalbelopps‑fältet.
   */
  onPdfAmount?: (v: number | null, setTotal: (s: string) => void) => void;
};

export function useBokforForm({ keys, defaultDate, onPdfAmount }: Options) {
  /* ---------------- state ---------------- */
  const [total, setTotal] = useState("");
  const [extra, setExtra] = useState(""); // ränta / moms / etc
  const [date, setDate] = useState(defaultDate ?? "");
  const [comment, setComment] = useState("");

  /* ------------- helpers ------------- */
  const toNum = (s: string) => {
    const n = parseFloat(s.replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  /* --------- default‑datum on mount ---------- */
  useEffect(() => {
    if (!defaultDate) {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [defaultDate]);

  /* ------------- validering ------------- */
  const valid =
    (!keys.includes("total") || toNum(total) !== null) &&
    (!keys.includes("extra") || toNum(extra) !== null) &&
    !!date;

  /* ------- hantera belopp från PDF‑parser ------- */
  const handlePdfAmount = useCallback(
    (v: number | null) => {
      onPdfAmount?.(v, setTotal);
    },
    [onPdfAmount]
  );

  /* ------------- public API ------------- */
  return {
    /* fältvärden */
    state: { total, extra, date, comment },

    /* set‑funktioner att binda till inputs */
    setters: { setTotal, setExtra, setDate, setComment },

    /* validering & konvertering */
    valid,
    toNum,

    /* callback att skicka som setBelopp till LaddaUppFil */
    handlePdfAmount,
  };
}
