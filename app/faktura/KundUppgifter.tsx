"use client";

import { useFakturaContext } from "./FakturaProvider";

export default function KundUppgifter() {
  const { formData, setFormData } = useFakturaContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="space-y-8">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-2 flex gap-6">
          <label className="flex items-center gap-2 text-white">
            <input
              type="radio"
              name="kundtyp"
              value="Företag"
              checked={formData.kundtyp === "Företag"}
              onChange={handleChange}
            />
            Företag
          </label>
          <label className="flex items-center gap-2 text-white">
            <input
              type="radio"
              name="kundtyp"
              value="Privatkund"
              checked={formData.kundtyp === "Privatkund"}
              onChange={handleChange}
            />
            Privatkund
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Namn</label>
          <input
            type="text"
            name="kundnamn"
            value={formData.kundnamn ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Organisationsnummer</label>
          <input
            type="text"
            name="kundorganisationsnummer"
            value={formData.kundorganisationsnummer ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">VAT-nummer</label>
          <input
            type="text"
            name="kundvatnummer"
            value={formData.kundvatnummer ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Kundnummer</label>
          <input
            type="text"
            name="kundnummer"
            value={formData.kundnummer ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Adress</label>
          <input
            type="text"
            name="kundadress"
            value={formData.kundadress ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Adress 2</label>
          <input
            type="text"
            name="kundadress2"
            value={formData.kundadress2 ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Postnummer</label>
          <input
            type="text"
            name="kundpostnummer"
            value={formData.kundpostnummer ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Stad</label>
          <input
            type="text"
            name="kundstad"
            value={formData.kundstad ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-white mb-2">E-post</label>
          <input
            type="email"
            name="kundemail"
            value={formData.kundemail ?? ""}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>
      </form>
    </div>
  );
}
