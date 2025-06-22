interface LöneKontrakt {
  månadslön: number;
  arbetstimmarPerVecka: number;
  skattetabell: string;
  skattekolumn: number;
  kommunalSkatt: number;
  socialaAvgifterSats: number;
}

interface DagAvdrag {
  föräldraledighet: number;
  vårdAvSjuktBarn: number;
  sjukfrånvaro: number;
}

// Bokios timlönsformel
export function beräknaTimlön(månadslön: number, arbetstimmarPerVecka: number): number {
  // månadslön x 12 månader / (52 veckor x arbetstimmar per vecka)
  return (månadslön * 12) / (52 * arbetstimmarPerVecka);
}

// Bokios daglönsformel
export function beräknaDaglön(månadslön: number): number {
  // 4,6% av månadslönen
  return månadslön * 0.046;
}

// Bokios veckolönsformel
export function beräknaVeckolön(månadslön: number): number {
  // Årslön / veckor per år
  return (månadslön * 12) / 52;
}

// Sociala avgifter
export function beräknaSocialaAvgifter(bruttolön: number, sats: number = 0.3142): number {
  return Math.round(bruttolön * sats);
}

// Lönekostnad
export function beräknaLönekostnad(bruttolön: number, socialaAvgifter: number): number {
  return bruttolön + socialaAvgifter;
}

// Skatteberäkning - progressiva satser baserat på Bokios exempel
export function beräknaSkatt(justeradMånadslön: number, kontrakt: LöneKontrakt): number {
  let skattesats: number;

  if (justeradMånadslön >= 35000) {
    skattesats = 0.21707; // 35 000+ kr
  } else if (justeradMånadslön >= 31500) {
    // ← SÄNK DENNA!
    skattesats = 0.21428; // 31 500-34 999 kr (inkluderar 31 780)
  } else if (justeradMånadslön >= 30000) {
    skattesats = 0.205; // 30 000-31 499 kr
  } else {
    skattesats = 0.19; // Under 30 000 kr
  }

  return Math.round(justeradMånadslön * skattesats);
}

// Huvudfunktion - följer Bokios logik exakt
export function beräknaKomplett(
  kontrakt: LöneKontrakt,
  övertidTimmar: number = 0,
  dagAvdrag: DagAvdrag = { föräldraledighet: 0, vårdAvSjuktBarn: 0, sjukfrånvaro: 0 }
) {
  // 1. Grundberäkningar
  const timlön = beräknaTimlön(kontrakt.månadslön, kontrakt.arbetstimmarPerVecka);
  const daglön = beräknaDaglön(kontrakt.månadslön);

  // 2. Övertidsersättning
  const övertidsersättning = övertidTimmar * timlön * 1.5; // Övertid ofta 150%

  // 3. VIKTIGT: Bokio drar av dagavdrag INNAN skatt och sociala avgifter
  const totalDagavdrag =
    (dagAvdrag.föräldraledighet + dagAvdrag.vårdAvSjuktBarn + dagAvdrag.sjukfrånvaro) * daglön;
  const justeradBruttolön = kontrakt.månadslön + övertidsersättning - totalDagavdrag;

  // 4. Beräkna skatt och sociala avgifter på JUSTERAD bruttolön (Bokios sätt)
  const skatt = beräknaSkatt(justeradBruttolön, kontrakt);
  const socialaAvgifter = beräknaSocialaAvgifter(justeradBruttolön, kontrakt.socialaAvgifterSats);
  const lönekostnad = beräknaLönekostnad(justeradBruttolön, socialaAvgifter);

  // 5. Nettolön = justerad bruttolön - skatt
  const nettolön = justeradBruttolön - skatt;

  return {
    // Grundvärden
    timlön: Math.round(timlön * 100) / 100, // Avrunda till 2 decimaler
    daglön: Math.round(daglön),

    // Huvudsummor (justerade enligt Bokios logik)
    bruttolön: justeradBruttolön,
    socialaAvgifter,
    lönekostnad,
    skatt,

    // Avdrag (för visning)
    dagavdrag: {
      föräldraledighet: dagAvdrag.föräldraledighet * daglön,
      vårdAvSjuktBarn: dagAvdrag.vårdAvSjuktBarn * daglön,
      sjukfrånvaro: dagAvdrag.sjukfrånvaro * daglön,
      totalt: totalDagavdrag,
    },

    // Slutresultat
    nettolön,
  };
}

// Hjälpfunktion för att beräkna ursprunglig grundlön (för visning)
export function beräknaUrsprungligGrundlön(
  justeradBruttolön: number,
  dagAvdrag: DagAvdrag,
  daglön: number
): number {
  const totalDagavdrag =
    (dagAvdrag.föräldraledighet + dagAvdrag.vårdAvSjuktBarn + dagAvdrag.sjukfrånvaro) * daglön;
  return justeradBruttolön + totalDagavdrag;
}
