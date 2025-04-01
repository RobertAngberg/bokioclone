"use client";

import { useState } from "react";

export default function ArtiklarTjanster() {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<FormDataRow[]>([createEmptyRow()]);

  type FormDataRow = {
    beskrivning: string;
    antal: string;
    prisPerEnhet: string;
    valuta: string;
    moms: string;
    typ: string;
  };

  function createEmptyRow(copy?: FormDataRow): FormDataRow {
    return {
      beskrivning: copy?.beskrivning || "",
      antal: copy?.antal || "",
      prisPerEnhet: copy?.prisPerEnhet || "",
      valuta: copy?.valuta || "SEK",
      moms: copy?.moms || "25",
      typ: copy?.typ || "Varor",
    };
  }

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const addAnotherRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows((prev) => [...prev, createEmptyRow(lastRow)]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
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
          {rows.map((formData, index) => {
            const antal = parseFloat(formData.antal || "0");
            const pris = parseFloat(formData.prisPerEnhet || "0");
            const momsProcent = parseFloat(formData.moms);
            const totalExkl = antal * pris;
            const totalInkl = totalExkl * (1 + momsProcent / 100);

            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex justify-end">
                  {rows.length > 1 && (
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
                    value={formData.beskrivning}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  />
                </div>

                <div>
                  <label className="block font-medium">Antal och enhet</label>
                  <input
                    name="antal"
                    value={formData.antal}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  />
                </div>

                <div>
                  <label className="block font-medium">Pris per enhet exkl. moms</label>
                  <input
                    name="prisPerEnhet"
                    value={formData.prisPerEnhet}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 text-black"
                  />
                </div>

                <div>
                  <label className="block font-medium">Valuta</label>
                  <select
                    name="valuta"
                    value={formData.valuta}
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
                    value={formData.moms}
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
                        checked={formData.typ === "Varor"}
                        onChange={(e) => handleChange(index, e)}
                      />
                      <span className="ml-1">Varor</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`typ-${index}`}
                        value="Tjänster"
                        checked={formData.typ === "Tjänster"}
                        onChange={(e) => handleChange(index, e)}
                      />
                      <span className="ml-1">Tjänster</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 mt-2">
                  <div>
                    Totalt exkl. moms: <strong>{formatCurrency(totalExkl, formData.valuta)}</strong>
                  </div>
                  <div>
                    Totalt inkl. moms: <strong>{formatCurrency(totalInkl, formData.valuta)}</strong>
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
