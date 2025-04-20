"use client";

import { useEffect, useState } from "react";
import { hamtaFöretagsprofil } from "../admin/actions";
import { useFakturaContext } from "./FakturaProvider";

export default function Forhandsgranskning() {
  const { formData } = useFakturaContext();
  const [profil, setProfil] = useState<any>(null);

  useEffect(() => {
    const hämtaProfil = async () => {
      const data = await hamtaFöretagsprofil();
      setProfil(data);
    };
    hämtaProfil();
  }, []);

  const formatDatum = (d: any) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("sv-SE");
    } catch {
      return d.toString();
    }
  };

  return (
    <div className="text-black p-10 font-serif w-full h-full bg-white text-sm leading-tight">
      {/* Företagsprofil */}
      {profil && (
        <div className="mb-8">
          <p className="font-bold text-lg">{profil.företagsnamn}</p>
          {profil.adress && <p>{profil.adress}</p>}
          {profil.postnummer && profil.stad && (
            <p>
              {profil.postnummer} {profil.stad}
            </p>
          )}
          {profil.organisationsnummer && <p>Org.nr: {profil.organisationsnummer}</p>}
          {profil.momsregistreringsnummer && <p>Momsreg.nr: {profil.momsregistreringsnummer}</p>}
          {profil.telefonnummer && <p>Tel: {profil.telefonnummer}</p>}
          {profil.bankinfo && <p>Bank: {profil.bankinfo}</p>}
          {profil.webbplats && <p>{profil.webbplats}</p>}
        </div>
      )}

      {/* Fakturametadata */}
      <div className="mb-8">
        <p className="text-lg font-bold mb-2">Faktura</p>
        <p>Fakturanummer: {formData.fakturanummer}</p>
        <p>Datum: {formatDatum(formData.fakturadatum)}</p>
        <p>Förfallodatum: {formatDatum(formData.forfallodatum)}</p>
        <p>Betalningsvillkor: {formData.betalningsvillkor}</p>
      </div>

      {/* Kunduppgifter */}
      <div className="mb-8">
        <p className="text-lg font-bold mb-2">Kund</p>
        <p>{formData.kundnamn}</p>
        <p>{formData.kundadress}</p>
        <p>
          {formData.kundpostnummer} {formData.kundstad}
        </p>
        {formData.kundnummer && <p>Kundnummer: {formData.kundnummer}</p>}
        {formData.kundorganisationsnummer && <p>Org.nr: {formData.kundorganisationsnummer}</p>}
        {formData.kundmomsnummer && <p>Momsreg.nr: {formData.kundmomsnummer}</p>}
      </div>

      {/* Artiklar */}
      <table className="w-full text-sm border border-gray-300 mb-8">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border-b border-gray-300">Beskrivning</th>
            <th className="p-2 border-b border-gray-300">Antal</th>
            <th className="p-2 border-b border-gray-300">Pris/st</th>
            <th className="p-2 border-b border-gray-300">Moms</th>
            <th className="p-2 border-b border-gray-300 text-right">Totalt</th>
          </tr>
        </thead>
        <tbody>
          {formData.artiklar?.map((rad: any, index: number) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="p-2">{rad.beskrivning}</td>
              <td className="p-2">{rad.antal}</td>
              <td className="p-2">
                {parseFloat(rad.prisPerEnhet ?? 0).toLocaleString("sv-SE")} kr
              </td>
              <td className="p-2">{rad.moms ?? "0"}%</td>
              <td className="p-2 text-right">
                {(
                  (parseFloat(rad.prisExMoms ?? 0) || 0) *
                  (parseFloat(rad.antal ?? 1) || 1) *
                  (1 + (parseFloat(rad.moms ?? 0) || 0) / 100)
                ).toLocaleString("sv-SE", {
                  style: "currency",
                  currency: "SEK",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Kommentar */}
      {formData.kommentar && (
        <div className="mt-6">
          <p className="font-bold">Kommentar</p>
          <p>{formData.kommentar}</p>
        </div>
      )}
    </div>
  );
}
