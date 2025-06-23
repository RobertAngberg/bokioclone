import { beräknaDaglön, beräknaTimlön } from "./grundberäkningar";
import { beräknaSocialaAvgifter, beräknaLönekostnad } from "./avgifter";
import { beräknaSkatt, beräknaSkattunderlag } from "./skatteberäkning";
import { LöneKontrakt, DagAvdrag } from "./typer";

/**
 * Komplett löneberäkning med extrarader (bakåtkompatibilitet)
 */
export function beräknaKomplett(
  kontrakt: LöneKontrakt,
  övertidTimmar: number = 0,
  dagAvdrag: DagAvdrag = { föräldraledighet: 0, vårdAvSjuktBarn: 0, sjukfrånvaro: 0 },
  extrarader: any[] = []
) {
  // 1. Grundberäkningar
  const timlön = beräknaTimlön(kontrakt.månadslön, kontrakt.arbetstimmarPerVecka);
  const daglön = beräknaDaglön(kontrakt.månadslön);

  // 2. Övertidsersättning
  const övertidsersättning = övertidTimmar * timlön * 1.5;

  // 3. Dagavdrag
  const totalDagavdrag =
    (dagAvdrag.föräldraledighet + dagAvdrag.vårdAvSjuktBarn + dagAvdrag.sjukfrånvaro) * daglön;

  // 4. Extrarader
  let extraradsSumma = 0;
  extrarader.forEach((rad) => {
    const belopp = parseFloat(rad.kolumn3) || 0;
    extraradsSumma += belopp;
  });

  const justeradBruttolön =
    kontrakt.månadslön + övertidsersättning - totalDagavdrag + extraradsSumma;

  // 5. Skatt med extrarader
  const skattunderlag = beräknaSkattunderlag(
    kontrakt.månadslön + övertidsersättning - totalDagavdrag,
    extrarader
  );
  const skatt = beräknaSkatt(skattunderlag);

  const socialaAvgifter = beräknaSocialaAvgifter(justeradBruttolön, kontrakt.socialaAvgifterSats);
  const lönekostnad = beräknaLönekostnad(justeradBruttolön, socialaAvgifter);
  const nettolön = justeradBruttolön - skatt;

  return {
    timlön: Math.round(timlön * 100) / 100,
    daglön: Math.round(daglön),
    bruttolön: justeradBruttolön,
    socialaAvgifter,
    lönekostnad,
    skatt,
    dagavdrag: {
      föräldraledighet: dagAvdrag.föräldraledighet * daglön,
      vårdAvSjuktBarn: dagAvdrag.vårdAvSjuktBarn * daglön,
      sjukfrånvaro: dagAvdrag.sjukfrånvaro * daglön,
      totalt: totalDagavdrag,
    },
    nettolön,
    skattunderlag,
  };
}

/**
 * Huvudfunktion för lönekomponenter
 */
export function beräknaLönekomponenter(
  grundlön: number,
  övertid: number,
  lönespec: any,
  extrarader: any[]
) {
  const originalGrundlön = grundlön ?? lönespec?.grundlön ?? lönespec?.bruttolön ?? 35000;
  const originalÖvertid = övertid ?? lönespec?.övertid ?? 0;

  // Skapa kontrakt
  const kontrakt: LöneKontrakt = {
    månadslön: originalGrundlön,
    arbetstimmarPerVecka: 40,
    skattetabell: "34",
    skattekolumn: 1,
    kommunalSkatt: 32,
    socialaAvgifterSats: 0.3142,
  };

  // Analysera extrarader
  const dagAvdrag: DagAvdrag = {
    föräldraledighet: 0,
    vårdAvSjuktBarn: 0,
    sjukfrånvaro: 0,
  };

  const övrigaExtrarader: any[] = [];

  extrarader.forEach((rad) => {
    const antal = parseFloat(rad.kolumn2) || 1;

    if (rad.kolumn1?.toLowerCase().includes("föräldraledighet")) {
      dagAvdrag.föräldraledighet = antal;
    } else if (rad.kolumn1?.toLowerCase().includes("vård av sjukt barn")) {
      dagAvdrag.vårdAvSjuktBarn = antal;
    } else if (rad.kolumn1?.toLowerCase().includes("sjuk")) {
      dagAvdrag.sjukfrånvaro = antal;
    } else {
      övrigaExtrarader.push(rad);
    }
  });

  // Beräkna övertidstimmar
  const övertidTimmar = originalÖvertid > 0 ? originalÖvertid / (originalGrundlön * 0.01) : 0;

  // Använd huvudberäkning
  const beräkningar = beräknaKomplett(kontrakt, övertidTimmar, dagAvdrag, övrigaExtrarader);

  return {
    grundlön: originalGrundlön,
    övertid: originalÖvertid,
    extraradsSumma: övrigaExtrarader.reduce((sum, rad) => sum + (parseFloat(rad.kolumn3) || 0), 0),
    bruttolön: beräkningar.bruttolön,
    socialaAvgifter: beräkningar.socialaAvgifter,
    skatt: beräkningar.skatt,
    nettolön: beräkningar.nettolön,
    lönekostnad: beräkningar.lönekostnad,
    timlön: beräkningar.timlön,
    daglön: beräkningar.daglön,
    dagavdrag: beräkningar.dagavdrag,
    skattunderlag: beräkningar.skattunderlag,
  };
}

/**
 * Förenklad version för nya komponenter
 */
export function beräknaKomplettLön(grundlön: number, extrarader: any[]) {
  const skattunderlag = beräknaSkattunderlag(grundlön, extrarader);
  const skatt = beräknaSkatt(skattunderlag);

  let extraradsSumma = 0;
  extrarader.forEach((rad) => {
    const belopp = parseFloat(rad.kolumn3) || 0;
    extraradsSumma += belopp;
  });

  const bruttolön = grundlön + extraradsSumma;
  const socialaAvgifter = beräknaSocialaAvgifter(bruttolön);
  const lönekostnad = beräknaLönekostnad(bruttolön, socialaAvgifter);
  const nettolön = bruttolön - skatt;

  return {
    skattunderlag,
    bruttolön,
    skatt,
    socialaAvgifter,
    lönekostnad,
    nettolön,
  };
}
