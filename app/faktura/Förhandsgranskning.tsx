//#region
/* eslint-disable @next/next/no-img-element */
"use client";

import { useFakturaContext } from "./FakturaProvider";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { hämtaFöretagsprofil } from "./actions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
//#endregion

export default function Forhandsgranskning() {
  const { formData, setFormData } = useFakturaContext();
  const { data: session } = useSession();
  const rows = formData.artiklar || [];
  const [profil, setProfil] = useState<any>(null);

  // Hämta företagsprofil vid mount
  useEffect(() => {
    const fetchProfil = async () => {
      if (!session?.user?.id) return;
      const data = await hämtaFöretagsprofil(session.user.id);
      setProfil(data);
    };
    fetchProfil();
  }, [session?.user?.id]);

  // Synka profil till formData när profil laddas
  useEffect(() => {
    if (profil) {
      setFormData((prev) => ({
        ...prev,
        företagsnamn: profil.företagsnamn ?? "",
        adress: profil.adress ?? "",
        postnummer: profil.postnummer ?? "",
        stad: profil.stad ?? "",
        organisationsnummer: profil.organisationsnummer ?? "",
        momsregistreringsnummer: profil.momsregistreringsnummer ?? "",
        telefonnummer: profil.telefonnummer ?? "",
        bankinfo: profil.bankinfo ?? "",
        webbplats: profil.webbplats ?? "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profil]);

  // Hämta logotyp från localStorage om den saknas
  useEffect(() => {
    if (!formData.logo) {
      const logo = localStorage.getItem("bokioclone_logo");
      if (logo) setFormData((prev) => ({ ...prev, logo }));
    }
    if (!formData.logoWidth) {
      const logoWidth = localStorage.getItem("bokioclone_logoWidth");
      if (logoWidth) setFormData((prev) => ({ ...prev, logoWidth: Number(logoWidth) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logotypstorlek-slider (endast i preview)
  const initialSlider = (((formData.logoWidth ?? 200) - 50) / 150) * 100;
  const [logoSliderValue, setLogoSliderValue] = useState(initialSlider);

  useEffect(() => {
    const calculated = 50 + (logoSliderValue / 100) * 150;
    setFormData((prev) => ({ ...prev, logoWidth: calculated }));
    localStorage.setItem("bokioclone_logoWidth", calculated.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoSliderValue]);

  const logoSize = formData.logoWidth ?? 200;

  // Summeringsberäkningar
  const sumExkl = rows.reduce(
    (acc, rad) =>
      acc + parseFloat(String(rad.antal) || "0") * parseFloat(String(rad.prisPerEnhet) || "0"),
    0
  );

  const totalMoms = rows.reduce((acc, rad) => {
    const antal = parseFloat(String(rad.antal) || "0");
    const pris = parseFloat(String(rad.prisPerEnhet) || "0");
    const moms = parseFloat(String(rad.moms) || "0");
    return acc + antal * pris * (moms / 100);
  }, 0);

  // ROT/RUT-avdrag enligt Skatteverket: 30% av arbetskostnad inkl moms
  // (justera procentsats och villkor om du har RUT eller annan procentsats)
  const arbetskostnadInklMoms = sumExkl + totalMoms;
  const rotRutAvdrag =
    formData.rotRutAktiverat && formData.rotRutTyp === "ROT"
      ? 0.3 * arbetskostnadInklMoms
      : formData.rotRutAktiverat && formData.rotRutTyp === "RUT"
        ? 0.5 * arbetskostnadInklMoms
        : 0;

  const totalSum = arbetskostnadInklMoms - rotRutAvdrag;
  const summaAttBetala = Math.max(totalSum, 0);

  // --- ROT/RUT-detaljer för förhandsgranskning ---
  const showRotRutDetails =
    formData.rotRutAktiverat && (formData.rotRutTyp === "ROT" || formData.rotRutTyp === "RUT");

  return (
    <>
      <div
        id="print-area"
        className="relative bg-white text-black w-[210mm] h-[297mm] p-10 text-[11pt] leading-relaxed overflow-hidden flex flex-col"
        style={{ backgroundColor: "#ffffff", minHeight: "297mm" }}
      >
        {/* Logotyp och logotyp-slider */}
        {formData.logo && (
          <div className="absolute top-10 right-10 group flex flex-col items-end">
            <img
              src={formData.logo}
              alt="Logotyp"
              style={{
                maxWidth: `${logoSize}px`,
                maxHeight: "200px",
                objectFit: "contain",
              }}
              className="transition-all"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={logoSliderValue}
              onChange={(e) => setLogoSliderValue(Number(e.target.value))}
              className="mt-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}

        {/* Wrapper för allt innehåll utom foten */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h1 className="text-4xl font-bold mb-16">Faktura</h1>
          <div className="grid grid-cols-2 gap-6 mb-20">
            <div>
              <p className="font-bold" style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
                {formData.företagsnamn}
              </p>
              <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>{formData.adress}</p>
              <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
                {formData.postnummer} {formData.stad}
              </p>
            </div>
            <div>
              <p className="font-bold" style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
                {formData.kundnamn}
              </p>
              <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>{formData.kundadress}</p>
              <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
                {formData.kundpostnummer} {formData.kundstad}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-10 text-[10pt]">
            {[
              ["Fakturanummer", formData.fakturanummer],
              ["Fakturadatum", formData.fakturadatum],
              ["Förfallodatum", formData.forfallodatum],
              ["Betalningsmetod", formData.betalningsmetod || "—"],
              ["Betalningsvillkor", formData.betalningsvillkor + " dagar"],
            ].map(([label, value], i) => (
              <div key={i}>
                <p className="font-bold">{label}</p>
                <p>{value}</p>
              </div>
            ))}
          </div>

          {/* ROT/RUT-detaljer */}
          {showRotRutDetails && (
            <div className="mb-8 p-4 rounded bg-yellow-50 border border-yellow-200 text-[10pt] text-black">
              <div className="font-bold mb-2">
                {formData.rotRutTyp === "ROT" ? "ROT-avdrag" : "RUT-avdrag"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div>
                    <span className="font-semibold">Arbetskostnad exkl. moms:</span>{" "}
                    {formData.arbetskostnadExMoms
                      ? Number(formData.arbetskostnadExMoms).toLocaleString("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        })
                      : "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Avdrag (%):</span>{" "}
                    {formData.avdragProcent ? `${formData.avdragProcent}%` : "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Beräknat avdrag:</span>{" "}
                    {formData.avdragBelopp !== undefined
                      ? Number(formData.avdragBelopp).toLocaleString("sv-SE", {
                          style: "currency",
                          currency: "SEK",
                        })
                      : "—"}
                  </div>
                </div>
                <div>
                  {formData.rotRutTyp === "ROT" && (
                    <>
                      <div>
                        <span className="font-semibold">Personnummer:</span>{" "}
                        {formData.personnummer || "—"}
                      </div>
                      {formData.rotBoendeTyp === "brf" ? (
                        <>
                          <div>
                            <span className="font-semibold">Organisationsnummer (BRF):</span>{" "}
                            {formData.brfOrganisationsnummer || "—"}
                          </div>
                          <div>
                            <span className="font-semibold">Lägenhetsnummer:</span>{" "}
                            {formData.brfLagenhetsnummer || "—"}
                          </div>
                        </>
                      ) : (
                        <div>
                          <span className="font-semibold">Fastighetsbeteckning:</span>{" "}
                          {formData.fastighetsbeteckning || "—"}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fakturarader */}
          <table
            className="w-full text-left border mb-6 text-[10pt]"
            style={{ borderColor: "#ccc" }}
          >
            <thead>
              <tr>
                {["Beskrivning", "Antal", "Pris", "Moms", "Belopp"].map((header, i) => (
                  <th
                    key={i}
                    className="p-2 border"
                    style={{ borderColor: "#ccc", verticalAlign: "middle", textAlign: "left" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((rad, i) => {
                const antal = parseFloat(String(rad.antal));
                const pris = parseFloat(String(rad.prisPerEnhet));
                const moms = parseFloat(String(rad.moms));
                const belopp = antal * pris * (1 + moms / 100);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #ccc" }}>
                    <td className="p-2" style={{ verticalAlign: "middle" }}>
                      {rad.beskrivning}
                    </td>
                    <td className="p-2" style={{ verticalAlign: "middle" }}>
                      {antal}
                    </td>
                    <td className="p-2" style={{ verticalAlign: "middle" }}>
                      {pris.toFixed(2)} {rad.valuta}
                    </td>
                    <td className="p-2" style={{ verticalAlign: "middle" }}>
                      {moms}%
                    </td>
                    <td className="p-2" style={{ verticalAlign: "middle" }}>
                      {belopp.toFixed(2)} {rad.valuta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summering */}
          <div className="text-right space-y-1 text-[10pt]">
            <p>
              <strong>Summa exkl. moms:</strong> {sumExkl.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
            </p>
            <p>
              <strong>Moms totalt:</strong> {totalMoms.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
            </p>
            {rotRutAvdrag > 0 && (
              <p className="font-bold">
                {formData.rotRutTyp === "ROT" ? "ROT-avdrag: –" : "RUT-avdrag: –"}
                {rotRutAvdrag.toLocaleString("sv-SE", { style: "currency", currency: "SEK" })}
              </p>
            )}
            <p className="text-lg font-bold mt-2">
              Summa att betala:{" "}
              {summaAttBetala.toLocaleString("sv-SE", { style: "currency", currency: "SEK" })}
            </p>
          </div>
        </div>

        {/* FOTEN */}
        <div
          className="grid grid-cols-2 mt-10 pt-6 text-[10pt]"
          style={{ borderTop: "1px solid #ccc" }}
        >
          <div className="space-y-1">
            <p className="font-bold" style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
              Namn
            </p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>{formData.adress}</p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
              {formData.postnummer} {formData.stad}
            </p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
              Org.nr: {formData.organisationsnummer ?? "—"}
            </p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
              Moms.nr: {formData.momsregistreringsnummer ?? "—"}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-bold" style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
              Kontaktuppgifter
            </p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>{session?.user?.name ?? "—"}</p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
              Telefon: {formData.telefonnummer ?? "—"}
            </p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>E-post: {formData.email}</p>
            <p style={{ lineHeight: 1.22, margin: "0 0 2px 0" }}>
              Webb: {formData.webbplats ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
