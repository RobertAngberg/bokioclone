"use client";

import { useEffect } from "react";
import { useFakturaContext } from "./FakturaProvider";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { sv } from "date-fns/locale";

registerLocale("sv", sv);

/* ──────────────────────────────────────────────── */
/*  Hjälpfunktioner                                */
/* ──────────────────────────────────────────────── */

const parseISODate = (value: unknown): Date | null => {
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const addDays = (date: Date, days: number) => {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
};

/* ──────────────────────────────────────────────── */
/*  Komponent                                      */
/* ──────────────────────────────────────────────── */

export default function Villkor() {
  const { formData, setFormData } = useFakturaContext();

  /* ───────────── Första mount: sätt standardvärden ───────────── */
  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10);

    setFormData((prev) => {
      let changed = false;
      const updated = { ...prev };

      if (!prev.fakturadatum) {
        updated.fakturadatum = todayISO;
        changed = true;
      }

      if (!prev.betalningsvillkor) {
        updated.betalningsvillkor = "30";
        changed = true;
      }

      if (!prev.drojsmalsranta) {
        updated.drojsmalsranta = "12";
        changed = true;
      }

      if (changed) {
        const fd = parseISODate(updated.fakturadatum);
        if (fd) {
          updated.forfallodatum = addDays(fd, parseInt(updated.betalningsvillkor as string, 10))
            .toISOString()
            .slice(0, 10);
        }
        return updated;
      }
      return prev;
    });
  }, [setFormData]);

  /* ─────────── Beräkna datumobjekt för DatePicker ─────────── */
  const fakturadatumDate = parseISODate(formData.fakturadatum);

  const fallbackForfallo = fakturadatumDate
    ? addDays(fakturadatumDate, parseInt(formData.betalningsvillkor || "30", 10))
    : null;

  const forfalloDate = parseISODate(formData.forfallodatum) ?? fallbackForfallo;

  /* ───────── Effekt: uppdatera förfallodatum dynamiskt ──────── */
  useEffect(() => {
    if (!fakturadatumDate) return;

    const days = parseInt(formData.betalningsvillkor || "30", 10);
    const calc = addDays(fakturadatumDate, isNaN(days) ? 30 : days)
      .toISOString()
      .slice(0, 10);

    if (calc !== formData.forfallodatum) {
      setFormData((prev) => ({ ...prev, forfallodatum: calc }));
    }
  }, [fakturadatumDate, formData.betalningsvillkor]);

  /* ─────────── Handlers ─────────── */
  const onDate = (field: "fakturadatum" | "forfallodatum") => (d: Date | null) =>
    setFormData((p) => ({
      ...p,
      [field]: d ? d.toISOString().slice(0, 10) : "",
    }));

  const onText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ─────────── UI ─────────── */
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fakturadatum */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Fakturadatum</label>
          <DatePicker
            selected={fakturadatumDate}
            onChange={onDate("fakturadatum")}
            dateFormat="yyyy-MM-dd"
            placeholderText="yyyy-mm-dd"
            locale="sv"
            isClearable
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700"
          />
        </div>

        {/* Förfallodatum */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Förfallodatum</label>
          <DatePicker
            selected={forfalloDate}
            onChange={onDate("forfallodatum")}
            dateFormat="yyyy-MM-dd"
            placeholderText="yyyy-mm-dd"
            locale="sv"
            isClearable
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700"
          />
        </div>

        {/* Betalningsvillkor */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Betalningsvillkor (dagar)
          </label>
          <input
            type="number"
            min="0"
            name="betalningsvillkor"
            value={formData.betalningsvillkor ?? ""}
            onChange={onText}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700"
          />
        </div>

        {/* Dröjsmålsränta */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Dröjsmålsränta (%)</label>
          <input
            type="number"
            step="0.01"
            name="drojsmalsranta"
            value={formData.drojsmalsranta ?? ""}
            onChange={onText}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
