"use client";

import { useState, useEffect } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { sparaNyKund, deleteKund, hämtaSparadeKunder, uppdateraKund } from "./actions";
import Knapp from "../_components/Knapp";

type KundSaveResponse = {
  success: boolean;
  id?: number;
};

export default function KundUppgifter() {
  const { formData, setFormData, kundStatus, setKundStatus, resetKund } = useFakturaContext();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [kunder, setKunder] = useState<any[]>([]);

  useEffect(() => {
    const laddaKunder = async () => {
      const sparade = await hämtaSparadeKunder();
      setKunder(sparade.sort((a: any, b: any) => a.kundnamn.localeCompare(b.kundnamn)));
    };
    laddaKunder();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    if (kundStatus === "loaded") {
      setKundStatus("editing");
    }
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

    if (formData.kundId) {
      // 🔥 Om vi redigerar en existerande kund
      res = await uppdateraKund(parseInt(formData.kundId, 10), fd);
    } else {
      // 🔥 Annars sparar vi en ny kund
      res = await sparaNyKund(fd);
    }

    setLoading(false);

    if (res.success) {
      if (!formData.kundId && res.id) {
        // Om vi skapade en ny kund, spara ID
        setFormData((p) => ({ ...p, kundId: res.id!.toString() }));
      }
      setKundStatus("loaded"); // Efter sparning, markera som loaded
      setShowSuccess(true);
      setFadeOut(false);

      setTimeout(() => setFadeOut(true), 1500);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert("❌ Kunde inte spara kund");
    }
  };

  const handleSelectCustomer = (kundId: string) => {
    const valdKund = kunder.find((k) => k.id.toString() === kundId);
    if (!valdKund) return;

    setFormData((prev) => ({
      ...prev,
      kundId: valdKund.id.toString(),
      kundnamn: valdKund.kundnamn,
      kundorganisationsnummer: valdKund.kundorgnummer,
      kundnummer: valdKund.kundnummer,
      kundmomsnummer: valdKund.kundmomsnummer,
      kundadress: valdKund.kundadress1,
      kundpostnummer: valdKund.kundpostnummer,
      kundstad: valdKund.kundstad,
      kundemail: valdKund.kundemail,
    }));
    setKundStatus("loaded");
  };

  const handleCreateNewCustomer = () => {
    resetKund();
    setKundStatus("editing");
  };

  const handleDeleteCustomer = async () => {
    if (!formData.kundId) return;
    const confirmed = confirm("Är du säker på att du vill ta bort kunden?");
    if (!confirmed) return;
    await deleteKund(parseInt(formData.kundId, 10));
    resetKund();
    setKundStatus("none");
    const sparade = await hämtaSparadeKunder();
    setKunder(sparade.sort((a: any, b: any) => a.kundnamn.localeCompare(b.kundnamn)));
  };

  return (
    <div className="space-y-6 text-white">
      {/* Toppsektion */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <select
          value={formData.kundId ?? ""}
          onChange={(e) => handleSelectCustomer(e.target.value)}
          className="h-10 px-3 rounded bg-slate-800 border border-slate-700 text-white"
        >
          <option value="">Välj existerande kund</option>
          {kunder.map((kund) => (
            <option key={kund.id} value={kund.id}>
              {kund.kundnamn}
            </option>
          ))}
        </select>

        {kundStatus === "loaded" && (
          <div className="flex gap-2">
            <Knapp onClick={() => setKundStatus("editing")} text="👤 Redigera kund" />
            <Knapp onClick={handleDeleteCustomer} text="🗑️ Ta bort kund" />
          </div>
        )}

        <Knapp onClick={handleCreateNewCustomer} text="➕ Skapa ny kund" />
      </div>

      {/* Visa info om vald kund */}
      {kundStatus === "loaded" && (
        <div className="space-y-2 bg-slate-800 p-4 rounded">
          <p>
            <strong>Kundnamn:</strong> {formData.kundnamn}
          </p>
          <p>
            <strong>Organisationsnummer:</strong> {formData.kundorganisationsnummer}
          </p>
          <p>
            <strong>Kundnummer:</strong> {formData.kundnummer}
          </p>
          <p>
            <strong>Momsnummer:</strong> {formData.kundmomsnummer}
          </p>
          <p>
            <strong>Adress:</strong> {formData.kundadress}
          </p>
          <p>
            <strong>Postnummer & Stad:</strong> {formData.kundpostnummer} {formData.kundstad}
          </p>
          <p>
            <strong>E‑post:</strong> {formData.kundemail}
          </p>
        </div>
      )}

      {/* Redigeringsformulär */}
      {kundStatus === "editing" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Kundnamn</label>
              <input
                name="kundnamn"
                value={formData.kundnamn}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organisationsnummer</label>
              <input
                name="kundorganisationsnummer"
                value={formData.kundorganisationsnummer}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kundnummer</label>
              <input
                name="kundnummer"
                value={formData.kundnummer}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Momsnummer</label>
              <input
                name="kundmomsnummer"
                value={formData.kundmomsnummer}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E‑post</label>
              <input
                name="kundemail"
                value={formData.kundemail}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adress</label>
              <input
                name="kundadress"
                value={formData.kundadress}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postnummer</label>
              <input
                name="kundpostnummer"
                value={formData.kundpostnummer}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stad</label>
              <input
                name="kundstad"
                value={formData.kundstad}
                onChange={handleChange}
                className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Knapp onClick={handleSave} text="💾 Spara kund" />
            {showSuccess && (
              <span
                className={`text-green-400 transition-opacity duration-500 ${
                  fadeOut ? "opacity-0" : "opacity-100"
                }`}
              >
                ✅ Sparat!
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
