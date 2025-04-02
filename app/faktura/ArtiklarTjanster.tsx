"use client";

import { useState } from "react";
import { useFakturaContext } from "./FakturaProvider";

export default function ArtiklarTjanster() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData } = useFakturaContext();

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = [...formData.artiklar];
    updated[index] = { ...updated[index], [name]: value };
    setFormData((prev) => ({ ...prev, artiklar: updated }));
  };

  const createEmptyRow = (copy?: (typeof formData.artiklar)[number]) => ({
    beskrivning: copy?.beskrivning || "",
    antal: copy?.antal || "",
    prisPerEnhet: copy?.prisPerEnhet || "",
    valuta: copy?.valuta || "SEK",
    moms: copy?.moms || "25",
    typ: copy?.typ || "Varor",
  });

  const addAnotherRow = () => {
    const last = formData.artiklar.at(-1);
    const newRow = createEmptyRow(last);
    setFormData((prev) => ({ ...prev, artiklar: [...prev.artiklar, newRow] }));
  };

  const removeRow = (index: number) => {
    const updated = formData.artiklar.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, artiklar: updated }));
  };

  const formatCurrency = (value: number, valuta: string) => {
    const localeMap: Record<string, string> = {
      SEK: "sv-SE",
      EUR: "de-DE",
      USD: "en-US",
      GBP: "en-GB",
      NOK: "nb-NO",
      DKK: "da-DK",
    };
    const locale = localeMap[valuta] || "sv-SE";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: valuta,
    }).format(value);
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">Artiklar & Tjänster</h2>
        <span className="text-white">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="transition-all duration-300 ease-in-out bg-cyan-900 p-6 text-white space-y-6">
          {formData.artiklar.map((row, index) => {
            const antal = parseFloat(row.antal || "0");
            const pris = parseFloat(row.prisPerEnhet || "0");
            const momsProcent = parseFloat(row.moms);
            const totalExkl = antal * pris;
            const totalInkl = totalExkl * (1 + momsProcent / 100);

            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex justify-end">
                  {formData.artiklar.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="text-sm text-red-400 hover:text-red-500"
                    >
                      Ta bort
                    </button>
                  )}
                </div>

                <div>
                  <label className="block font-medium">Beskrivning</label>
                  <input
                    name="beskrivning"
                    value={row.beskrivning}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  />
                </div>

                <div>
                  <label className="block font-medium">Antal och enhet</label>
                  <input
                    name="antal"
                    value={row.antal}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  />
                </div>

                <div>
                  <label className="block font-medium">Pris per enhet exkl. moms</label>
                  <input
                    name="prisPerEnhet"
                    value={row.prisPerEnhet}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  />
                </div>

                <div>
                  <label className="block font-medium">Valuta</label>
                  <select
                    name="valuta"
                    value={row.valuta}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  >
                    <option value="SEK">SEK (kr)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NOK">NOK (kr)</option>
                    <option value="DKK">DKK (kr)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium">Moms</label>
                  <select
                    name="moms"
                    value={row.moms}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  >
                    <option value="25">25%</option>
                    <option value="12">12%</option>
                    <option value="6">6%</option>
                    <option value="0">0%</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium">Typ</label>
                  <div className="flex space-x-4 mt-1">
                    <label>
                      <input
                        type="radio"
                        name={`typ-${index}`}
                        value="Varor"
                        checked={row.typ === "Varor"}
                        onChange={(e) => handleChange(index, e)}
                      />
                      <span className="ml-1">Varor</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`typ-${index}`}
                        value="Tjänster"
                        checked={row.typ === "Tjänster"}
                        onChange={(e) => handleChange(index, e)}
                      />
                      <span className="ml-1">Tjänster</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 mt-2">
                  <div>
                    Totalt exkl. moms: <strong>{formatCurrency(totalExkl, row.valuta)}</strong>
                  </div>
                  <div>
                    Totalt inkl. moms: <strong>{formatCurrency(totalInkl, row.valuta)}</strong>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-4">
            <button
              type="button"
              onClick={addAnotherRow}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Lägg till en till
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
