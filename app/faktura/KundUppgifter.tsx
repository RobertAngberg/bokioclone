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
    <div className="space-y-6">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="kundtyp"
              value="Företag"
              checked={formData.kundtyp === "Företag"}
              onChange={handleChange}
            />
            Företag
          </label>
          <label className="flex items-center gap-2">
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
          <label className="block text-sm font-medium text-white">Namn</label>
          <input
            type="text"
            name="kundnamn"
            value={formData.kundnamn}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Adress</label>
          <input
            type="text"
            name="kundadress"
            value={formData.kundadress}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Postnummer</label>
          <input
            type="text"
            name="kundpostnummer"
            value={formData.kundpostnummer}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Stad</label>
          <input
            type="text"
            name="kundstad"
            value={formData.kundstad}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-white">E-post</label>
          <input
            type="email"
            name="kundemail"
            value={formData.kundemail}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-900 text-white border border-slate-700 rounded-lg"
          />
        </div>
      </form>
    </div>
  );
}
