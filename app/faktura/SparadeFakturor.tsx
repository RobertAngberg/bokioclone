//#region Huvud
"use client";

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
  activeInvoiceId?: number;
}
//#endregion

export default function SparadeFakturor({
  onSelectInvoice,
  onDeleteInvoice,
  fakturor,
  activeInvoiceId,
}: Props) {
  // ✅ Ta bort animation state - behövs inte längre

  const handleSelectInvoice = (id: number) => {
    onSelectInvoice(id);
    // ✅ Ta bort animation-logik - behövs inte längre
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
      {/* Fakturor */}
      <div>
        <h3 className="text-xl font-semibold mb-2">🧾 Fakturor</h3>

        {/* ✅ Ta bort temporär animation - vi har permanent status nu */}

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

              const isActive = activeInvoiceId === faktura.id;

              return (
                <li
                  key={faktura.id}
                  className={`bg-slate-900 border rounded px-4 py-2 hover:bg-slate-800 ${
                    isActive ? "border-green-500" : "border-slate-700"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="cursor-pointer" onClick={() => handleSelectInvoice(faktura.id)}>
                      <div>
                        #{faktura.fakturanummer} – {faktura.kundnamn ?? "Okänd kund"}
                      </div>
                      <div className="text-gray-400 text-sm">{datum}</div>
                      {isActive && (
                        <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                          ✅ Inladdad
                        </div>
                      )}
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
