// Kom ihåg; loggan sparas i localStorage

//#region Imports och types
"use client";

import { useEffect, useState, useTransition } from "react";
import { useFakturaContext } from "./FakturaProvider";
import KundUppgifter from "./KundUppgifter";
import ProdukterTjanster from "./ProdukterTjänster/ProdukterTjänster";
import Förhandsgranskning from "./Förhandsgranskning/Förhandsgranskning";
import SparadeFakturor from "./SparadeFakturor";
import AnimeradFlik from "../_components/AnimeradFlik";
import Knapp from "../_components/Knapp";
import MainLayout from "../_components/MainLayout";
import Alternativ from "./Alternativ/Alternativ";
import Betalning from "./Betalning";
import Avsandare from "./Avsandare";
import type { Artikel } from "./actions";
import {
  saveInvoice,
  hämtaFakturaMedRader,
  deleteFaktura,
  deleteKund,
  hämtaSparadeArtiklar,
  deleteFavoritArtikel,
  hämtaSparadeFakturor,
} from "./actions";

type Props = {
  kunder: any[];
  fakturor: any[];
  artiklar?: Artikel[];
};
//#endregion

export default function Fakturor({ kunder: initialKunder, fakturor: initialFakturor }: Props) {
  //#region Context och state
  const { formData, setFormData, setKundStatus } = useFakturaContext();
  const [showPreview, setShowPreview] = useState(false);
  const [kunder, setKunder] = useState(initialKunder);
  const [fakturor, setFakturor] = useState(initialFakturor);
  const [artiklar, setArtiklar] = useState<Artikel[]>([]);
  const [isPending, startTransition] = useTransition();
  //#endregion

  // Spåra aktiv faktura
  const currentInvoiceId = formData.id ? parseInt(formData.id) : undefined;

  // Hämta sparade artiklar
  useEffect(() => {
    hämtaSparadeArtiklar().then(setArtiklar);
  }, []);

  // Lyssna på reloadFakturor event
  useEffect(() => {
    const reload = async () => {
      const nyaFakturor = await hämtaSparadeFakturor();
      setFakturor(nyaFakturor);
    };

    const handler = () => reload();
    window.addEventListener("reloadFakturor", handler);
    return () => window.removeEventListener("reloadFakturor", handler);
  }, []);

  //#region Hanterare
  const hanteraValdKund = (kund: any) => {
    setFormData((prev) => ({
      ...prev,
      kundId: kund.id?.toString() ?? "",
      kundnamn: kund.kundnamn,
      kundnummer: kund.kundnummer,
      kundorganisationsnummer: kund.kundorgnummer,
      kundvatnummer: kund.kundmomsnummer,
      kundadress: kund.kundadress1,
      kundpostnummer: kund.kundpostnummer,
      kundstad: kund.kundstad,
      kundemail: kund.kundemail,
    }));
    setKundStatus("loaded");
  };

  const hanteraValdFaktura = async (id: number) => {
    const data = await hämtaFakturaMedRader(id);
    if (!data || !data.faktura) {
      alert("❌ Kunde inte hämta faktura");
      return;
    }

    const { faktura, artiklar, rotRut } = data;

    setFormData((prev) => ({
      ...prev,
      id: faktura.id,
      fakturanummer: faktura.fakturanummer ?? "",
      fakturadatum: faktura.fakturadatum?.toISOString
        ? faktura.fakturadatum.toISOString().slice(0, 10)
        : (faktura.fakturadatum ?? ""),
      forfallodatum: faktura.forfallodatum?.toISOString
        ? faktura.forfallodatum.toISOString().slice(0, 10)
        : (faktura.forfallodatum ?? ""),
      betalningsmetod: faktura.betalningsmetod ?? "",
      betalningsvillkor: faktura.betalningsvillkor ?? "",
      drojsmalsranta: faktura.drojsmalsranta ?? "",
      kundId: faktura.kundId?.toString() ?? "",
      nummer: faktura.nummer ?? "",
      kundmomsnummer: faktura.kundmomsnummer ?? "",
      kundnamn: faktura.kundnamn ?? "",
      kundnummer: faktura.kundnummer ?? "",
      kundorganisationsnummer: faktura.kundorganisationsnummer ?? "",
      kundadress: faktura.kundadress ?? "",
      kundpostnummer: faktura.kundpostnummer ?? "",
      kundstad: faktura.kundstad ?? "",
      kundemail: faktura.kundemail ?? "",
      företagsnamn: faktura.företagsnamn ?? "",
      email: faktura.email ?? "",
      adress: faktura.adress ?? "",
      postnummer: faktura.postnummer ?? "",
      stad: faktura.stad ?? "",
      organisationsnummer: faktura.organisationsnummer ?? "",
      momsregistreringsnummer: faktura.momsregistreringsnummer ?? "",
      telefonnummer: faktura.telefonnummer ?? "",
      bankinfo: faktura.bankinfo ?? "",
      webbplats: faktura.webbplats ?? "",
      logo: faktura.logo ?? "",
      logoWidth: faktura.logo_width ?? 200,
      artiklar: artiklar.map((rad: any) => ({
        beskrivning: rad.beskrivning,
        antal: Number(rad.antal),
        prisPerEnhet: Number(rad.pris_per_enhet ?? rad.prisPerEnhet),
        moms: Number(rad.moms),
        valuta: rad.valuta ?? "SEK",
        typ: rad.typ === "tjänst" ? "tjänst" : "vara",
        rotRutTyp: rad.rot_rut_typ ?? rad.rotRutTyp,
        rotRutKategori: rad.rot_rut_kategori ?? rad.rotRutKategori,
        avdragProcent: rad.avdrag_procent ?? rad.avdragProcent,
        arbetskostnadExMoms: rad.arbetskostnad_ex_moms ?? rad.arbetskostnadExMoms,
      })),
      // ROT/RUT-fält från rot_rut-tabellen
      rotRutAktiverat: !!rotRut.typ,
      rotRutTyp: rotRut.typ ?? "",
      rotRutKategori: rotRut.rot_rut_kategori ?? "",
      avdragProcent: rotRut.avdrag_procent ?? "",
      arbetskostnadExMoms: rotRut.arbetskostnad_ex_moms ?? "",
      avdragBelopp: rotRut.avdrag_belopp ?? "",
      personnummer: rotRut.personnummer ?? "",
      fastighetsbeteckning: rotRut.fastighetsbeteckning ?? "",
      rotBoendeTyp: rotRut.rot_boende_typ ?? "",
      brfOrganisationsnummer: rotRut.brf_organisationsnummer ?? "",
      brfLagenhetsnummer: rotRut.brf_lagenhetsnummer ?? "",
    }));

    setKundStatus("loaded");
  };

  const hanteraRaderaFaktura = (id: number) => {
    if (!confirm("❌ Vill du ta bort fakturan?")) return;
    startTransition(() => {
      setFakturor((prev) => prev.filter((f) => f.id !== id));
      deleteFaktura(id);
    });
  };

  const hanteraRaderaKund = (id: number) => {
    if (!confirm("❌ Vill du ta bort kunden?")) return;
    startTransition(() => {
      setKunder((prev) => prev.filter((k) => k.id !== id));
      deleteKund(id);
    });
  };

  const hanteraRaderaArtikel = async (id: number) => {
    if (!confirm("❌ Vill du ta bort artikeln?")) return;
    await deleteFavoritArtikel(id);
    setArtiklar((prev) => prev.filter((a) => a.id !== id));
  };

  const hanteraSpara = async () => {
    const fd = new FormData();
    try {
      fd.append("artiklar", JSON.stringify(formData.artiklar ?? []));
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== "artiklar" && v != null) fd.append(k, String(v));
      });
      const res = await saveInvoice(fd);

      if (res.success) {
        alert("✅ Faktura sparad!");
        const nyaFakturor = await hämtaSparadeFakturor();
        setFakturor(nyaFakturor);
      } else {
        alert("❌ Kunde inte spara fakturan.");
      }
    } catch {
      alert("❌ Kunde inte konvertera artiklar");
    }
  };
  //#endregion

  return (
    <>
      <MainLayout>
        <h1 className="text-3xl text-center mb-8">Fakturor</h1>

        <AnimeradFlik title="Sparade fakturor" icon="📂">
          <SparadeFakturor
            onSelectCustomer={hanteraValdKund}
            onSelectInvoice={hanteraValdFaktura}
            onDeleteCustomer={hanteraRaderaKund}
            onDeleteInvoice={hanteraRaderaFaktura}
            onDeleteArtikel={hanteraRaderaArtikel}
            onSelectArtiklar={(a) =>
              setFormData((prev) => ({
                ...prev,
                artiklar: [...(prev.artiklar ?? []), ...a],
              }))
            }
            kunder={kunder}
            fakturor={fakturor}
            artiklar={artiklar}
            activeInvoiceId={currentInvoiceId}
          />
        </AnimeradFlik>

        <AnimeradFlik title="Avsändare" icon="🧑‍💻">
          <Avsandare />
        </AnimeradFlik>

        <AnimeradFlik title="Kunduppgifter" icon="🧑‍💼">
          <KundUppgifter />
        </AnimeradFlik>

        <AnimeradFlik title="Produkter & Tjänster" icon="📦">
          <ProdukterTjanster />
        </AnimeradFlik>

        <AnimeradFlik title="Betalning" icon="💰">
          <Betalning />
        </AnimeradFlik>

        <AnimeradFlik title="Alternativ" icon="⚙️">
          <Alternativ
            onSave={hanteraSpara}
            onReload={() => window.location.reload()}
            onPrint={() => window.print()}
            onPreview={() => setShowPreview(true)}
          />
        </AnimeradFlik>
      </MainLayout>

      <div id="print-area" className="hidden print:block">
        <Förhandsgranskning />
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white max-w-[95vw] max-h-[95vh] overflow-auto shadow-2xl border border-gray-300 rounded-none">
            <div className="absolute top-4 right-4 z-50">
              <Knapp onClick={() => setShowPreview(false)} text="❌ Stäng" />
            </div>
            <div className="p-6 flex justify-center">
              <div className="w-[210mm] h-[297mm] bg-white shadow border rounded">
                <Förhandsgranskning />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
