"use client";

import { useState } from "react";

interface Props {
  onSelectCustomer: (kund: any) => void;
  onSelectInvoice: (id: number) => void;
  kunder: any[]; // 👈 nu via props
  fakturor: any[]; // 👈 nu via props
}

export default function Existerande({
  onSelectCustomer,
  onSelectInvoice,
  kunder,
  fakturor,
}: Props) {
  const [showLoadedMsg, setShowLoadedMsg] = useState(false);
  const [fadeOutMsg, setFadeOutMsg] = useState(false);

  const [showFakturaMsg, setShowFakturaMsg] = useState(false);
  const [fadeOutFakturaMsg, setFadeOutFakturaMsg] = useState(false);

  const handleSelectCustomer = (kund: any) => {
    onSelectCustomer(kund);
    setShowLoadedMsg(true);
    setFadeOutMsg(false);
    setTimeout(() => setFadeOutMsg(true), 700);
    setTimeout(() => setShowLoadedMsg(false), 1300);
  };

  const handleSelectInvoice = (id: number) => {
    onSelectInvoice(id);
    setShowFakturaMsg(true);
    setFadeOutFakturaMsg(false);
    setTimeout(() => setFadeOutFakturaMsg(true), 700);
    setTimeout(() => setShowFakturaMsg(false), 1300);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
      {/* Kunder */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Kunder</h3>

        {showLoadedMsg && (
          <div
            className={`mb-2 text-sm text-white transition-opacity duration-500 ease-in-out ${
              fadeOutMsg ? "opacity-0" : "opacity-100"
            }`}
          >
            ✔️ Kunduppgifter laddade
          </div>
        )}

        {kunder.length === 0 ? (
          <p className="text-gray-400 italic">Inga kunder hittades.</p>
        ) : (
          <ul className="space-y-2">
            {kunder.map((kund) => (
              <li
                key={kund.id}
                className="bg-slate-900 border border-slate-700 rounded px-4 py-2 flex justify-between items-center hover:bg-slate-800"
              >
                <span className="cursor-pointer" onClick={() => handleSelectCustomer(kund)}>
                  {kund.kundnamn}
                  {kund.kundemail && <span className="text-gray-400"> – {kund.kundemail}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fakturor */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Fakturor</h3>

        {showFakturaMsg && (
          <div
            className={`mb-2 text-sm text-white transition-opacity duration-500 ease-in-out ${
              fadeOutFakturaMsg ? "opacity-0" : "opacity-100"
            }`}
          >
            ✔️ Faktura laddad
          </div>
        )}

        {fakturor.length === 0 ? (
          <p className="text-gray-400 italic">Inga fakturor hittades.</p>
        ) : (
          <ul className="space-y-2">
            {fakturor.map((faktura) => {
              const datum = faktura.fakturadatum
                ? new Date(faktura.fakturadatum).toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";
              return (
                <li
                  key={faktura.id}
                  className="bg-slate-900 border border-slate-700 rounded px-4 py-2 flex justify-between items-center hover:bg-slate-800"
                >
                  <span className="cursor-pointer" onClick={() => handleSelectInvoice(faktura.id)}>
                    #{faktura.fakturanummer} &nbsp; – &nbsp; {datum} &nbsp; – &nbsp;
                    {faktura.kundnamn ?? "Okänd kund"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
