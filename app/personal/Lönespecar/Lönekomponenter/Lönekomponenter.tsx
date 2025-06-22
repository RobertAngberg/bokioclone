//#region Huvud
"use client";

import { useEffect, useState, useMemo } from "react";
import { hämtaExtrarader, taBortExtrarad } from "../../actions";
import ExtraRader from "../Extrarader/Extrarader";
import LöneTabell from "./LöneTabell";
import { beräknaKomplett, beräknaSocialaAvgifter, beräknaLönekostnad } from "../LöneBeräkningar";

type LönekomponenterProps = {
  lönespec: any;
  grundlön?: number;
  övertid?: number;
  bruttolön?: number;
  socialaAvgifter?: number;
  skatt?: number;
  onBeräkningarUppdaterade?: (lönespecId: string, beräkningar: any) => void;
};

export default function Lönekomponenter({
  lönespec,
  grundlön,
  övertid,
  onBeräkningarUppdaterade,
}: LönekomponenterProps) {
  //#endregion

  //#region State
  const [extrarader, setExtrarader] = useState<any[]>([]);
  //#endregion

  //#region Beräkningar
  function beräknaLönekomponenter(
    grundlön: number,
    övertid: number,
    lönespec: any,
    extrarader: any[]
  ) {
    const originalGrundlön = grundlön ?? lönespec?.grundlön ?? lönespec?.bruttolön ?? 35000;
    const originalÖvertid = övertid ?? lönespec?.övertid ?? 0;

    // Skapa kontrakt för LöneBeräkningar
    const kontrakt = {
      månadslön: originalGrundlön,
      arbetstimmarPerVecka: 40,
      skattetabell: "34",
      skattekolumn: 1,
      kommunalSkatt: 32,
      socialaAvgifterSats: 0.3142,
    };

    // Analysera extrarader för dagavdrag
    const dagAvdrag = {
      föräldraledighet: 0,
      vårdAvSjuktBarn: 0,
      sjukfrånvaro: 0,
    };

    let övrigaExtrarader = 0;

    extrarader.forEach((rad) => {
      const antal = parseFloat(rad.kolumn2) || 1;
      const aSek = parseFloat(rad.kolumn3) || 0;
      const totalVärde = antal * aSek;

      // Identifiera dagavdrag baserat på benämning
      if (rad.kolumn1?.toLowerCase().includes("föräldraledighet")) {
        dagAvdrag.föräldraledighet = antal; // Antal dagar
      } else if (rad.kolumn1?.toLowerCase().includes("vård av sjukt barn")) {
        dagAvdrag.vårdAvSjuktBarn = antal; // Antal dagar
      } else if (rad.kolumn1?.toLowerCase().includes("sjuk")) {
        dagAvdrag.sjukfrånvaro = antal; // Antal dagar
      } else {
        // Andra extrarader läggs till bruttolön
        övrigaExtrarader += totalVärde;
      }
    });

    // Beräkna övertidstimmar (förenklat)
    const övertidTimmar = originalÖvertid > 0 ? originalÖvertid / (originalGrundlön * 0.01) : 0;

    // Använd LöneBeräkningar för korrekt beräkning
    const beräkningar = beräknaKomplett(kontrakt, övertidTimmar, dagAvdrag);

    // Lägg till övriga extrarader till bruttolön
    const slutligBruttolön = beräkningar.bruttolön + övrigaExtrarader;
    const slutligaSocialaAvgifter = beräknaSocialaAvgifter(slutligBruttolön);
    const slutligLönekostnad = beräknaLönekostnad(slutligBruttolön, slutligaSocialaAvgifter);
    const slutligNettolön = slutligBruttolön - beräkningar.skatt;

    return {
      grundlön: originalGrundlön,
      övertid: originalÖvertid,
      extraradsSumma: övrigaExtrarader,
      bruttolön: slutligBruttolön,
      socialaAvgifter: slutligaSocialaAvgifter,
      skatt: beräkningar.skatt,
      nettolön: slutligNettolön,
      lönekostnad: slutligLönekostnad,

      // Lägg till detaljerad info från LöneBeräkningar
      timlön: beräkningar.timlön,
      daglön: beräkningar.daglön,
      dagavdrag: beräkningar.dagavdrag,
    };
  }

  const beräknadeVärden = useMemo(() => {
    return beräknaLönekomponenter(grundlön ?? 0, övertid ?? 0, lönespec, extrarader);
  }, [grundlön, övertid, lönespec, extrarader]);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (lönespec?.id) {
      hämtaExtrarader(lönespec.id).then(setExtrarader);
    }
  }, [lönespec?.id]);

  // Skicka beräkningar till parent - SEPARAT useEffect
  useEffect(() => {
    if (onBeräkningarUppdaterade && lönespec?.id && beräknadeVärden) {
      onBeräkningarUppdaterade(lönespec.id, beräknadeVärden);
    }
  }, [beräknadeVärden, onBeräkningarUppdaterade, lönespec?.id]);
  //#endregion

  //#region Handlers
  // Hantera borttagning av extrarad
  const handleTaBortExtrarad = async (extraradId: number) => {
    if (confirm("Är du säker på att du vill ta bort denna rad?")) {
      try {
        await taBortExtrarad(extraradId);
        if (lönespec?.id) {
          hämtaExtrarader(lönespec.id).then(setExtrarader);
        }
      } catch (error) {
        console.error("Fel vid borttagning av extrarad:", error);
        alert("Kunde inte ta bort raden");
      }
    }
  };

  const handleNyRad = () => {
    if (lönespec?.id) {
      hämtaExtrarader(lönespec.id).then(setExtrarader);
    }
  };
  //#endregion

  return (
    <div className="bg-slate-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Lönekomponenter</h3>

      <LöneTabell
        beräknadeVärden={beräknadeVärden}
        extrarader={extrarader}
        onTaBortExtrarad={handleTaBortExtrarad}
      />

      <ExtraRader
        lönespecId={lönespec?.id}
        grundlön={beräknadeVärden.grundlön}
        onNyRad={handleNyRad}
      />
    </div>
  );
}
