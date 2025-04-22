"use client";

import { useFakturaContext } from "./FakturaProvider";

export default function Ovrigt() {
  const { formData, setFormData } = useFakturaContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Betalningsmetod</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Välj metod</label>
          <select
            name="betalningsmetod"
            value={formData.betalningsmetod ?? ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700"
          >
            <option value="Bankgiro">Bankgiro</option>
            <option value="Plusgiro">Plusgiro</option>
            <option value="Bankkonto">Bankkonto</option>
            <option value="Swish">Swish</option>
            <option value="PayPal">PayPal</option>
            <option value="IBAN">IBAN</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Nummer</label>
          <input
            name="nummer"
            value={formData.nummer ?? ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 text-white border border-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
