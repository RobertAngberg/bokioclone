"use client";

import { useFakturaContext } from "./FakturaProvider";

export default function Forhandsgranskning() {
  const { formData } = useFakturaContext();
  const rows = formData.artiklar || [];

  const sumExkl = rows.reduce((acc, rad) => {
    const antal = parseFloat(rad.antal || "0");
    const pris = parseFloat(rad.prisPerEnhet || "0");
    return acc + antal * pris;
  }, 0);

  const totalMoms = rows.reduce((acc, rad) => {
    const antal = parseFloat(rad.antal || "0");
    const pris = parseFloat(rad.prisPerEnhet || "0");
    const moms = parseFloat(rad.moms || "0");
    return acc + antal * pris * (moms / 100);
  }, 0);

  const totalSum = sumExkl + totalMoms;

  return (
    <div className="bg-white text-black shadow mx-auto w-[210mm] h-[297mm] p-10 text-[11pt] leading-relaxed print:block overflow-hidden">
      <h1 className="text-xl font-bold mb-4">Faktura</h1>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold">Företagsuppgifter</h3>
          <p>{formData.företagsnamn}</p>
          <p>{formData.adress}</p>
          <p>
            {formData.postnummer} {formData.stad}
          </p>
          <p>{formData.email}</p>
        </div>

        <div>
          <h3 className="font-semibold">Kunduppgifter</h3>
          <p>{formData.kundnamn}</p>
          <p>{formData.kundadress}</p>
          <p>
            {formData.kundpostnummer} {formData.kundstad}
          </p>
          <p>{formData.kundemail}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold">Fakturainformation</h3>
          <p>Fakturanummer: {formData.fakturanummer}</p>
          <p>Fakturadatum: {formData.fakturadatum}</p>
          <p>Förfallodatum: {formData.forfallodatum}</p>
          <p>Betalningsvillkor: {formData.betalningsvillkor} dagar</p>
          <p>Dröjsmålsränta: {formData.drojsmalsranta}</p>
          <p>Leverans: {formData.leverans}</p>
        </div>

        <div>
          <h3 className="font-semibold">Betalning</h3>
          <p>Betalningsmetod: {formData.betalningsmetod}</p>
          <p>Betalningsinfo: {formData.betalningsinfo}</p>
          <p>Momsvisning: {formData.visaMoms}</p>
        </div>
      </div>

      <table className="w-full text-left border border-gray-300 mb-6 text-[10pt]">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Beskrivning</th>
            <th className="p-2 border">Antal</th>
            <th className="p-2 border">Pris</th>
            <th className="p-2 border">Moms</th>
            <th className="p-2 border">Belopp</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((rad, i) => {
            const antal = parseFloat(rad.antal || "0");
            const pris = parseFloat(rad.prisPerEnhet || "0");
            const moms = parseFloat(rad.moms || "0");
            const belopp = antal * pris * (1 + moms / 100);

            return (
              <tr key={i} className="odd:bg-gray-50 even:bg-white">
                <td className="p-2 border">{rad.beskrivning}</td>
                <td className="p-2 border">{antal || 0}</td>
                <td className="p-2 border">
                  {pris.toFixed(2)} {rad.valuta}
                </td>
                <td className="p-2 border">{moms || 0}%</td>
                <td className="p-2 border">
                  {belopp.toFixed(2)} {rad.valuta}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-right space-y-1 text-[10pt]">
        <p>
          <strong>Summa exkl. moms:</strong> {sumExkl.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
        </p>
        <p>
          <strong>Moms totalt:</strong> {totalMoms.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
        </p>
        <p className="text-lg font-bold">
          Summa att betala: {totalSum.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
        </p>
      </div>
    </div>
  );
}
