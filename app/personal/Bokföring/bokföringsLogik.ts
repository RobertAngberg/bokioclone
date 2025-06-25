import { KONTO_MAPPNINGAR, hittaBokföringsregel, type BokföringsRegel } from "./bokföringsRegler";

export interface BokföringsRad {
  konto: string;
  kontoNamn: string;
  debet: number;
  kredit: number;
  beskrivning: string;
  anställdNamn?: string;
}

export interface BokföringsSummering {
  rader: BokföringsRad[];
  totalDebet: number;
  totalKredit: number;
  balanserar: boolean;
}

export function genereraBokföringsrader(
  lönespecar: Record<string, any>,
  anställda: any[]
): BokföringsSummering {
  const bokföringsrader: BokföringsRad[] = [];
  const anställdMap = new Map(anställda.map((a) => [a.id, a]));

  Object.entries(lönespecar).forEach(([anställdId, lönespec]) => {
    const anställd = anställdMap.get(parseInt(anställdId));
    const anställdNamn = anställd ? `${anställd.förnamn} ${anställd.efternamn}` : "Okänd";

    // ✅ BERÄKNA TOTAL BRUTTOLÖN (grundlön + alla tillägg)
    let totalBruttolön = Number(
      lönespec.beräknadeVärden?.bruttolön || lönespec.bruttolön || lönespec.grundlön || 0
    );

    // EXTRARADER - LÄGG TILL I TOTAL BRUTTOLÖN
    if (lönespec.extrarader && Array.isArray(lönespec.extrarader)) {
      lönespec.extrarader.forEach((rad: any, index: number) => {
        const belopp = Number(rad.kolumn3 || rad.belopp || 0);
        const beskrivning = rad.kolumn1 || "Extrarad";

        if (belopp > 0) {
          // LÄGG TILL I TOTAL BRUTTOLÖN
          totalBruttolön += belopp;

          // LÄGG ÄVEN TILL SOM SEPARAT BOKFÖRINGSRAD FÖR TYDLIGHET
          let regel = KONTO_MAPPNINGAR.grundlön; // Default

          const beskrivningLower = beskrivning.toLowerCase();
          if (beskrivningLower.includes("övertid") || beskrivningLower.includes("overtid")) {
            regel = KONTO_MAPPNINGAR.övertid;
          } else if (beskrivningLower.includes("bil")) {
            regel = KONTO_MAPPNINGAR.bilförmån;
          } else if (beskrivningLower.includes("förmån")) {
            regel = KONTO_MAPPNINGAR.annanForman;
          }

          bokföringsrader.push({
            konto: regel.debet!,
            kontoNamn: regel.namn,
            debet: belopp,
            kredit: 0,
            beskrivning: `${beskrivning} - ${anställdNamn}`,
            anställdNamn,
          });
        }
      });
    } else {
      console.log("❌ INGA EXTRARADER HITTADE");
    }

    // ALLA ANDRA FÄLT - LÄGG TILL I TOTAL BRUTTOLÖN
    Object.entries(lönespec).forEach(([fältNamn, värde]) => {
      if (
        typeof värde === "object" ||
        fältNamn === "extrarader" ||
        fältNamn === "beräknadeVärden" ||
        fältNamn === "bruttolön" ||
        fältNamn === "grundlön" ||
        fältNamn === "id" ||
        fältNamn === "anställd_id" ||
        fältNamn === "period_start" ||
        fältNamn === "period_slut" ||
        fältNamn === "månad" ||
        fältNamn === "år" ||
        fältNamn === "status" ||
        fältNamn === "kommentar" ||
        fältNamn === "skapad" ||
        fältNamn === "uppdaterad" ||
        fältNamn === "skapad_av" ||
        fältNamn === "skatt" ||
        fältNamn === "sociala_avgifter" ||
        fältNamn === "nettolön"
      ) {
        return; // Skippa dessa
      }

      const belopp = Number(värde || 0);
      if (belopp > 0) {
        const fältLower = fältNamn.toLowerCase();
        if (
          fältLower.includes("övertid") ||
          fältLower.includes("tillägg") ||
          fältLower.includes("bonus")
        ) {
          totalBruttolön += belopp;

          // Lägg till som bokföringsrad
          let regel = KONTO_MAPPNINGAR.övertid;
          if (fältLower.includes("bonus")) {
            regel = KONTO_MAPPNINGAR.grundlön;
          }

          bokföringsrader.push({
            konto: regel.debet!,
            kontoNamn: regel.namn,
            debet: belopp,
            kredit: 0,
            beskrivning: `${fältNamn} - ${anställdNamn}`,
            anställdNamn,
          });
        }
      }
    });

    // GRUNDLÖN BOKFÖRING
    const grundlön = Number(
      lönespec.beräknadeVärden?.bruttolön || lönespec.bruttolön || lönespec.grundlön || 0
    );
    if (grundlön > 0) {
      bokföringsrader.push({
        konto: KONTO_MAPPNINGAR.grundlön.debet!,
        kontoNamn: KONTO_MAPPNINGAR.grundlön.namn,
        debet: grundlön,
        kredit: 0,
        beskrivning: `Grundlön - ${anställdNamn}`,
        anställdNamn,
      });
    }

    // ✅ SOCIALA AVGIFTER - BERÄKNA PÅ TOTAL BRUTTOLÖN!
    const socialaAvgifter = Math.round(totalBruttolön * 0.3142); // 31,42% på TOTAL bruttolön

    if (socialaAvgifter > 0) {
      bokföringsrader.push({
        konto: KONTO_MAPPNINGAR.socialaAvgifter.debet!,
        kontoNamn: KONTO_MAPPNINGAR.socialaAvgifter.namn,
        debet: socialaAvgifter,
        kredit: 0,
        beskrivning: `Sociala avgifter - ${anställdNamn}`,
        anställdNamn,
      });

      bokföringsrader.push({
        konto: KONTO_MAPPNINGAR.socialaAvgifter.kredit!,
        kontoNamn: "Avräkning lagstadgade sociala avgifter",
        debet: 0,
        kredit: socialaAvgifter,
        beskrivning: `Avräkning sociala avgifter - ${anställdNamn}`,
        anställdNamn,
      });
    }

    // PRELIMINÄR SKATT (använd original från lönespec)
    const skatt = Number(lönespec.beräknadeVärden?.skatt || lönespec.skatt || 0);
    if (skatt > 0) {
      bokföringsrader.push({
        konto: KONTO_MAPPNINGAR.preliminärSkatt.kredit!,
        kontoNamn: KONTO_MAPPNINGAR.preliminärSkatt.namn,
        debet: 0,
        kredit: skatt,
        beskrivning: `Preliminär skatt - ${anställdNamn}`,
        anställdNamn,
      });
    }

    // ✅ NETTOLÖN - BERÄKNA PÅ TOTAL BRUTTOLÖN!
    const ursprungligNettolön = Number(
      lönespec.beräknadeVärden?.nettolön || lönespec.nettolön || 0
    );
    const tilläggsBelopp = totalBruttolön - Number(lönespec.bruttolön || lönespec.grundlön || 0);
    const nyNettolön = ursprungligNettolön + tilläggsBelopp; // Lägg till övertiden direkt!

    if (nyNettolön > 0) {
      bokföringsrader.push({
        konto: KONTO_MAPPNINGAR.nettolön.kredit!,
        kontoNamn: KONTO_MAPPNINGAR.nettolön.namn,
        debet: 0,
        kredit: nyNettolön,
        beskrivning: `Nettolön utbetalning - ${anställdNamn}`,
        anställdNamn,
      });
    }
  });

  const summeradeRader = summeraBokföringsrader(bokföringsrader);

  let totalDebet = 0;
  let totalKredit = 0;
  summeradeRader.forEach((rad) => {
    totalDebet += Number(rad.debet || 0);
    totalKredit += Number(rad.kredit || 0);
  });

  return {
    rader: summeradeRader,
    totalDebet: Math.round(totalDebet * 100) / 100,
    totalKredit: Math.round(totalKredit * 100) / 100,
    balanserar: Math.abs(totalDebet - totalKredit) < 0.01,
  };
}

function summeraBokföringsrader(rader: BokföringsRad[]): BokföringsRad[] {
  const kontoMap = new Map<string, BokföringsRad>();

  rader.forEach((rad) => {
    const nyckel = `${rad.konto}-${rad.kontoNamn}`;

    if (kontoMap.has(nyckel)) {
      const befintlig = kontoMap.get(nyckel)!;
      befintlig.debet = Number(befintlig.debet || 0) + Number(rad.debet || 0);
      befintlig.kredit = Number(befintlig.kredit || 0) + Number(rad.kredit || 0);
    } else {
      kontoMap.set(nyckel, {
        konto: rad.konto,
        kontoNamn: rad.kontoNamn,
        debet: Number(rad.debet || 0),
        kredit: Number(rad.kredit || 0),
        beskrivning: rad.kontoNamn,
      });
    }
  });

  return Array.from(kontoMap.values()).sort((a, b) => a.konto.localeCompare(b.konto));
}
