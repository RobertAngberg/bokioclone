"use client";

import TextFält from "../_components/TextFält";

export default function Personalinformation() {
  const personalData = {
    namn: "Anna Andersson",
    mail: "anna.andersson@företag.se",
    personnummer: "199001011234",
    adress: "Testgatan 12A, 123 45, Stockholm",
    bankkonto: "1234-5678901234",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Personalinformation</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Namn</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {personalData.namn}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Mail</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {personalData.mail}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Personnummer</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {personalData.personnummer}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Adress</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {personalData.adress}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Bankkonto</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {personalData.bankkonto}
          </div>
        </div>
      </div>
    </div>
  );
}
