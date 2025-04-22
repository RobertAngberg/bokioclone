"use client";

import { useEffect, useRef, useState } from "react";
import { FakturaProvider, useFakturaContext } from "./FakturaProvider";
import Avsandare from "./Avsandare";
import KundUppgifter from "./KundUppgifter";
import ProdukterTjanster from "./ProdukterTjanster";
import Villkor from "./Villkor";
import Ovrigt from "./Ovrigt";
import ExportPdfButton from "./ExportPdfButton";
import Forhandsgranskning from "./Forhandsgranskning";
import { saveInvoice, hämtaFakturaMedRader } from "./actions";
import Existerande from "./Existerande";
import ForhandsgranskaKnapp from "./ForhandsgranskaKnapp";
import { hamtaFöretagsprofil } from "../admin/actions";
import Loading from "./Loading";

function AnimatedFlik({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  const toggle = () => {
    if (!open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
      setOpen(true);
    } else {
      setHeight(contentRef.current?.scrollHeight + "px");
      requestAnimationFrame(() => setHeight("0px"));
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={toggle}
        className="w-full px-4 py-3 text-lg font-semibold flex justify-between bg-slate-900 hover:bg-slate-800 transition"
      >
        <span>
          {icon} {title}
        </span>
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▼</span>
      </button>
      <div ref={contentRef} style={{ height, transition: "height 300ms ease", overflow: "hidden" }}>
        <div className="p-4 bg-slate-900">{children}</div>
      </div>
    </div>
  );
}

function Fakturasida() {
  const { formData, setFormData, kundStatus, setKundStatus } = useFakturaContext();
  const [showPreview, setShowPreview] = useState(false);
  const [profil, setProfil] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profil = await hamtaFöretagsprofil();
      setProfil(profil);
      requestAnimationFrame(() => setIsLoading(false));
    })();
  }, []);

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
    setIsLoading(true);
    const data = await hämtaFakturaMedRader(id);
    if (!data || !data.faktura) {
      alert("❌ Kunde inte hämta faktura");
      setIsLoading(false);
      return;
    }
    const { faktura, artiklar } = data;

    setFormData({
      id: faktura.id,
      fakturanummer: faktura.fakturanummer ?? "",
      fakturadatum: faktura.fakturadatum?.toISOString().slice(0, 10) ?? "",
      forfallodatum: faktura.forfallodatum?.toISOString().slice(0, 10) ?? "",
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
      företagsnamn: "",
      email: "",
      adress: "",
      postnummer: "",
      stad: "",
      organisationsnummer: "",
      momsregistreringsnummer: "",
      telefonnummer: "",
      bankinfo: "",
      webbplats: "",
      logo: "",
      artiklar: artiklar.map((rad: any) => ({
        beskrivning: rad.beskrivning,
        antal: Number(rad.antal),
        prisPerEnhet: Number(rad.prisPerEnhet),
        moms: Number(rad.moms),
        valuta: rad.valuta ?? "SEK",
        typ: (rad.typ === "tjänst" ? "tjänst" : "vara") as "tjänst" | "vara",
      })),
    });

    setKundStatus("loaded");
    requestAnimationFrame(() => setIsLoading(false));
  };

  const handleSave = async () => {
    const fd = new FormData();
    try {
      fd.append("artiklar", JSON.stringify(formData.artiklar ?? []));
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== "artiklar" && v != null) fd.append(k, String(v));
      });
      const res = await saveInvoice(fd);
      alert(res.success ? "✅ Faktura sparad!" : "❌ Kunde inte spara fakturan.");
    } catch {
      alert("❌ Kunde inte konvertera artiklar");
    }
  };

  return (
    <>
      <main className="min-h-screen bg-slate-950 px-4 py-10 print:hidden text-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
            <h1 className="text-3xl text-center mb-8">Fakturor</h1>

            <Loading isLoading={isLoading} minHeight="20rem">
              <div className="space-y-6">
                <AnimatedFlik title="Ladda in existerande" icon="📂">
                  <Existerande
                    onSelectCustomer={hanteraValdKund}
                    onSelectInvoice={hanteraValdFaktura}
                  />
                </AnimatedFlik>

                <AnimatedFlik title="Kunduppgifter" icon="🧑‍💻">
                  <KundUppgifter />
                </AnimatedFlik>

                <AnimatedFlik title="Produkter & Tjänster" icon="📦">
                  <ProdukterTjanster />
                </AnimatedFlik>

                <AnimatedFlik title="Villkor" icon="⚖️">
                  <Villkor />
                </AnimatedFlik>

                <AnimatedFlik title="Övrigt" icon="🗒️">
                  <Ovrigt />
                </AnimatedFlik>

                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="h-10 px-4 bg-cyan-700 rounded hover:bg-cyan-800"
                    >
                      💾 Spara
                    </button>
                    <ExportPdfButton />
                    <button
                      onClick={() => window.print()}
                      className="h-10 px-4 bg-cyan-700 rounded hover:bg-cyan-800"
                    >
                      🖨️ Skriv ut
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800"
                    >
                      🔁 Börja om
                    </button>
                  </div>
                  <ForhandsgranskaKnapp onClick={() => setShowPreview(true)} />
                </div>
              </div>
            </Loading>
          </div>
        </div>
      </main>

      {/* Skriv ut-version */}
      <div id="print-area" className="hidden print:block">
        <Forhandsgranskning />
      </div>

      {/* Modal för förhandsgranskning */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white max-w-[95vw] max-h-[95vh] overflow-auto shadow-2xl border border-gray-300 rounded-none">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800 z-50"
            >
              ❌ Stäng
            </button>
            <div className="p-6 flex justify-center">
              <div className="w-[210mm] h-[297mm] bg-white shadow border rounded">
                <Forhandsgranskning />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <FakturaProvider>
      <Fakturasida />
    </FakturaProvider>
  );
}
