"use client";

import { useState, useEffect } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { sparaNyKund, uppdateraKund } from "./actions";

type KundSaveResponse = {
  success: boolean;
  id?: number;
};

export default function KundUppgifter() {
  const { formData, setFormData, kundStatus, setKundStatus, resetKund } = useFakturaContext();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append("kundnamn", formData.kundnamn);
    fd.append("kundorgnummer", formData.kundorganisationsnummer);
    fd.append("kundnummer", formData.kundnummer);
    fd.append("kundmomsnummer", formData.kundmomsnummer);
    fd.append("kundadress1", formData.kundadress);
    fd.append("kundpostnummer", formData.kundpostnummer);
    fd.append("kundstad", formData.kundstad);
    fd.append("kundemail", formData.kundemail);

    let res: KundSaveResponse;
    if (kundStatus === "loaded" && formData.kundId) {
      res = await uppdateraKund(parseInt(formData.kundId, 10), fd);
    } else {
      res = await sparaNyKund(fd);
    }

    setLoading(false);

    if (res.success && res.id) {
      setFormData((p) => ({ ...p, kundId: res.id!.toString() }));
      setKundStatus("editing"); // Behåll formuläret öppet
      setShowSuccess(true);
      setFadeOut(false);

      setTimeout(() => setFadeOut(true), 1500);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("❌ Kunde inte spara kund");
    }
  };

  return (
    <div className="space-y-4 text-white">
      {formData.kundId && (
        <div className="text-gray-400 italic">
          📝 Redigerar befintlig kund (ID: {formData.kundId})
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Kundnamn</label>
          <input
            name="kundnamn"
            value={formData.kundnamn}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Organisationsnummer</label>
          <input
            name="kundorganisationsnummer"
            value={formData.kundorganisationsnummer}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Kundnummer</label>
          <input
            name="kundnummer"
            value={formData.kundnummer}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Momsnummer</label>
          <input
            name="kundmomsnummer"
            value={formData.kundmomsnummer}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">E‑post</label>
          <input
            name="kundemail"
            value={formData.kundemail}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Adress</label>
          <input
            name="kundadress"
            value={formData.kundadress}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Postnummer</label>
          <input
            name="kundpostnummer"
            value={formData.kundpostnummer}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Stad</label>
          <input
            name="kundstad"
            value={formData.kundstad}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-cyan-700 hover:bg-cyan-800 rounded"
        >
          {loading ? "Sparar…" : "Spara kund"}
        </button>
        {showSuccess && (
          <span
            className={`text-green-400 transition-opacity duration-500 ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
          >
            ✅ Sparat! Kunden finns nu under <em>Existerande → Kunder</em>
          </span>
        )}
      </div>
    </div>
  );
}
