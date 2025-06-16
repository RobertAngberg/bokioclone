//#region Huvud
"use client";

import { useEffect, useState, useMemo } from "react";
import { hämtaExtrarader, taBortExtrarad } from "../../actions";
import ExtraRader from "../Extrarader/Extrarader";
import LöneTabell from "./LöneTabell";

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

    // Summera alla extrarader
    const extraradsSumma = extrarader.reduce((total, rad) => {
      const antal = parseFloat(rad.kolumn2) || 1;
      const aSek = parseFloat(rad.kolumn3) || 0;
      return total + antal * aSek;
    }, 0);

    // Beräkna bruttolön (grundlön + övertid + extrarader)
    const nyBruttolön = originalGrundlön + originalÖvertid + extraradsSumma;

    // Sociala avgifter: 31,42% av bruttolön
    const nySocialaAvgifter = nyBruttolön * 0.3142;

    // Skatt: Bokios sats verkar vara ~21,974%
    const nySkatt = nyBruttolön * 0.21974;

    // Nettolön = bruttolön - skatt
    const nyNettolön = nyBruttolön - nySkatt;

    // Lönekostnad = bruttolön + sociala avgifter
    const nyLönekostnad = nyBruttolön + nySocialaAvgifter;

    return {
      grundlön: originalGrundlön,
      övertid: originalÖvertid,
      extraradsSumma,
      bruttolön: nyBruttolön,
      socialaAvgifter: nySocialaAvgifter,
      skatt: nySkatt,
      nettolön: nyNettolön,
      lönekostnad: nyLönekostnad,
    };
  }

  const beräknadeVärden = useMemo(
    () => beräknaLönekomponenter(grundlön ?? 0, övertid ?? 0, lönespec, extrarader),
    [grundlön, övertid, lönespec, extrarader]
  );
  //#endregion

  //#region Effects: Hämta extrarader och skicka beräkningar
  useEffect(() => {
    if (lönespec?.id) {
      hämtaExtrarader(lönespec.id).then(setExtrarader);
    }
  }, [lönespec?.id]);

  // Skicka beräkningar till parent när de ändras
  useEffect(() => {
    if (onBeräkningarUppdaterade && lönespec?.id) {
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
