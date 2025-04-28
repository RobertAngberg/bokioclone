"use client";

import { useState } from "react";

interface Props {
  onSelectCustomer: (kund: any) => void;
  onSelectInvoice: (id: number) => void;
  onDeleteCustomer: (id: number) => void;
  onDeleteInvoice: (id: number) => void;
  onDeleteArtikel?: (id: number) => void;
  kunder: any[];
  fakturor: any[];
  artiklar?: any[];
  onSelectArtiklar?: (artiklar: any[]) => void;
}

export default function Existerande({
  onSelectCustomer,
  onSelectInvoice,
  onDeleteCustomer,
  onDeleteInvoice,
  onDeleteArtikel,
  kunder,
  fakturor,
  artiklar = [],
  onSelectArtiklar,
}: Props) {
  const [showLoadedMsg, setShowLoadedMsg] = useState(false);
  const [fadeOutMsg, setFadeOutMsg] = useState(false);
  const [showFakturaMsg, setShowFakturaMsg] = useState(false);
  const [fadeOutFakturaMsg, setFadeOutFakturaMsg] = useState(false);
  const [blinkArtikelId, setBlinkArtikelId] = useState<number | null>(null);

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

  const handleSelectArtikel = (artikel: any) => {
    if (!onSelectArtiklar) return;
    onSelectArtiklar([artikel]);
    setBlinkArtikelId(artikel.id);
    setTimeout(() => setBlinkArtikelId(null), 200); // Blinkar i 200ms
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
      {/* Fakturor */}
      <div>
        <h3 className="text-xl font-semibold mb-2">🧾 Fakturor</h3>

        {showFakturaMsg && (
          <div
            className={`mb-2 text-sm transition-opacity duration-500 ${
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
                  className="bg-slate-900 border border-slate-700 rounded px-4 py-2 hover:bg-slate-800"
                >
                  <div className="flex justify-between">
                    <div className="cursor-pointer" onClick={() => handleSelectInvoice(faktura.id)}>
                      <div>
                        #{faktura.fakturanummer} – {faktura.kundnamn ?? "Okänd kund"}
                      </div>
                      <div className="text-gray-400 text-sm">{datum}</div>
                    </div>
                    <button
                      onClick={() => onDeleteInvoice(faktura.id)}
                      className="hover:text-red-500 text-lg ml-4"
                      title="Ta bort faktura"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
