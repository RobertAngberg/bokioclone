//#region Huvud
"use client";

import { useEffect } from "react";
import { useFakturaContext } from "./FakturaProvider";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { sv } from "date-fns/locale";
import TextFält from "../_components/TextFält";
//#endregion

export default function Betalning() {
  const { formData, setFormData } = useFakturaContext();

  registerLocale("sv", sv);

  const parseISODate = (value: unknown): Date | null => {
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value === "string") {
      const d = new Date(value.trim());
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const addDays = (date: Date, days: number) => {
    const out = new Date(date);
    out.setDate(out.getDate() + days);
    return out;
  };

  // Sätter standardvärden för fakturadatum, betalningsvillkor och dröjsmålsränta vid första render.
  // Om något av dessa saknas sätts de till: dagens datum, 30 dagar betalningsvillkor och 12% ränta.
  // Förfallodatum beräknas automatiskt baserat på fakturadatum + betalningsvillkor.
  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    setFormData((prev) => {
      const updated = { ...prev };
      let changed = false;

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
          updated.forfallodatum = addDays(fd, parseInt(updated.betalningsvillkor, 10))
            .toISOString()
            .slice(0, 10);
        }
        return updated;
      }

      return prev;
    });
  }, [setFormData]);

  const fakturadatumDate = parseISODate(formData.fakturadatum);
  const fallbackForfallo = fakturadatumDate
    ? addDays(fakturadatumDate, parseInt(formData.betalningsvillkor || "30", 10))
    : null;
  const forfalloDate = parseISODate(formData.forfallodatum) ?? fallbackForfallo;

  // Håller förfallodatum i synk med fakturadatum + betalningsvillkor.
  useEffect(() => {
    if (!fakturadatumDate) return;
    const days = parseInt(formData.betalningsvillkor || "30", 10);
    const calc = addDays(fakturadatumDate, isNaN(days) ? 30 : days)
      .toISOString()
      .slice(0, 10);
    if (calc !== formData.forfallodatum) {
      setFormData((prev) => ({ ...prev, forfallodatum: calc }));
    }
  }, [fakturadatumDate, formData.betalningsvillkor, formData.forfallodatum, setFormData]);

  const onDate = (field: "fakturadatum" | "forfallodatum") => (d: Date | null) =>
    setFormData((p) => ({
      ...p,
      [field]: d ? d.toISOString().slice(0, 10) : "",
    }));

  // FIX: Acceptera både input och textarea för TextFält
  const onText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <TextFält
          label="Betalningsvillkor (dagar)"
          name="betalningsvillkor"
          value={formData.betalningsvillkor ?? ""}
          onChange={onText}
        />

        <TextFält
          label="Dröjsmålsränta (%)"
          name="drojsmalsranta"
          value={formData.drojsmalsranta ?? ""}
          onChange={onText}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Välj betalningsmetod</label>
          <select
            name="betalningsmetod"
            value={formData.betalningsmetod ?? ""}
            onChange={onSelectChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700"
          >
            <option value="">Välj betalningsmetod</option>
            <option value="Bankgiro">Bankgiro</option>
            <option value="Plusgiro">Plusgiro</option>
            <option value="Bankkonto">Bankkonto</option>
            <option value="Swish">Swish</option>
            <option value="PayPal">PayPal</option>
            <option value="IBAN">IBAN</option>
          </select>
        </div>

        <TextFält label="Nummer" name="nummer" value={formData.nummer ?? ""} onChange={onText} />
      </div>
    </div>
  );
}
