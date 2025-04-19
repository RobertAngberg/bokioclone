"use client";

import { useState, useEffect } from "react";
import { sparaNyKund, hämtaSparadeKunder } from "./actions";
import Steg2 from "./Steg2";
import { useFakturaContext } from "./FakturaProvider";

export default function Steg1() {
  const { setFormData } = useFakturaContext();
  const [visaForm, setVisaForm] = useState(false);
  const [visaKunder, setVisaKunder] = useState(false);
  const [visaSteg2, setVisaSteg2] = useState(false);
  const [kundData, setKundData] = useState({
    kundtyp: "Företag",
    kundnamn: "",
    kundorgnummer: "",
    kundnummer: "",
    kundmomsnummer: "",
    kundadress1: "",
    kundadress2: "",
    kundpostnummer: "",
    kundstad: "",
  });
  const [sparatMeddelande, setSparatMeddelande] = useState(false);
  const [kunder, setKunder] = useState<any[]>([]);
  const [laddarKunder, setLaddarKunder] = useState(false);

  const toggleForm = () => {
    setVisaForm(!visaForm);
    if (visaKunder) setVisaKunder(false);
  };

  const toggleKunder = async () => {
    setVisaKunder(!visaKunder);
    if (visaForm) setVisaForm(false);
    if (!visaKunder) {
      setLaddarKunder(true);
      const res = await hämtaSparadeKunder();
      if (Array.isArray(res)) setKunder(res);
      setLaddarKunder(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKundData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const formData = new FormData();
    Object.entries(kundData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const res = await sparaNyKund(formData);
    if (res.success) {
      setVisaForm(false);
      setSparatMeddelande(true);
      setTimeout(() => setSparatMeddelande(false), 3000);
    } else {
      alert("❌ Kunde inte spara kund");
    }
  };

  const hanteraValdKund = (kund: any) => {
    setFormData((prev) => ({
      ...prev,
      kundtyp: kund.kundtyp,
      kundnamn: kund.kundnamn,
      kundnummer: kund.kundnummer,
      kundorganisationsnummer: kund.kundorgnummer,
      kundvatnummer: kund.kundmomsnummer,
      kundadress: kund.kundadress1,
      kundadress2: kund.kundadress2,
      kundpostnummer: kund.kundpostnummer,
      kundstad: kund.kundstad,
    }));
    setVisaSteg2(true);
  };

  if (visaSteg2) return <Steg2 />;

  return (
    <div className="bg-slate-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8 bg-cyan-950 border border-cyan-800 p-10 rounded-xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center">Fakturor</h1>

        {sparatMeddelande && (
          <div className="text-center text-white text-base animate-fadeOut">
            Sparat! Kunden ligger nu under Befintliga kunder.
          </div>
        )}

        <div className="flex flex-col gap-4 text-center">
          <button
            onClick={toggleForm}
            className="px-6 py-3 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-lg"
          >
            ➕ Ny kund
          </button>
          <button
            onClick={toggleKunder}
            className="px-6 py-3 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-lg"
          >
            🗂️ Befintliga kunder
          </button>
        </div>

        {/* Formulär */}
        {visaForm && (
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 transition-all duration-300"
            style={{ overflow: "hidden" }}
          >
            <div className="col-span-2">
              <label className="block mb-1 text-sm">Kundtyp</label>
              <div className="flex gap-4">
                {["Företag", "Privatkund"].map((typ) => (
                  <label key={typ} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="kundtyp"
                      value={typ}
                      checked={kundData.kundtyp === typ}
                      onChange={handleChange}
                    />
                    {typ}
                  </label>
                ))}
              </div>
            </div>

            {[
              ["kundnummer", "Kundnummer"],
              ["kundnamn", "Kundnamn"],
              ["kundorgnummer", "Organisationsnummer"],
              ["kundmomsnummer", "VAT-nummer"],
              ["kundadress1", "Postadress"],
              ["kundadress2", "Postadress 2"],
              ["kundpostnummer", "Postnummer"],
              ["kundstad", "Stad"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="block mb-1 text-sm">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={kundData[name as keyof typeof kundData] ?? ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
                />
              </div>
            ))}

            <div className="col-span-2 text-center pt-4">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white text-lg"
              >
                💾 Spara kund
              </button>
            </div>
          </form>
        )}

        {/* Kundlista */}
        {visaKunder && (
          <div className="mt-6 space-y-2">
            {laddarKunder ? (
              <div className="flex justify-center items-center py-4">
                <div className="h-6 w-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
              </div>
            ) : kunder.length === 0 ? (
              <div className="text-sm italic text-center text-gray-400">Inga kunder hittades.</div>
            ) : (
              kunder.map((kund, index) => (
                <div
                  key={index}
                  onClick={() => hanteraValdKund(kund)}
                  className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded"
                >
                  {kund.kundnamn} ({kund.kundnummer})
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
