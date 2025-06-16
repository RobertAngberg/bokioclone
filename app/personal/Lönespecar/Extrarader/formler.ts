//#region Karensavdrag
// Beräknar veckolön från månadslön
export const beräknaVeckolön = (månadslön: number): number => {
  // Genomsnittlig månad = 4,33 veckor (52 veckor / 12 månader)
  return månadslön / 4.33;
};

// Beräknar veckosjuklön (80% av veckolön)
export const beräknaVeckosjuklön = (veckolön: number): number => {
  return veckolön * 0.8;
};

// Beräknar karensavdrag enligt lag (20% av veckosjuklön)
export const beräknaKarensavdrag = (månadslön: number): number => {
  const veckolön = beräknaVeckolön(månadslön);
  const veckosjuklön = beräknaVeckosjuklön(veckolön);
  const karensavdrag = veckosjuklön * 0.2;

  // Returnera som negativt tal (avdrag)
  return -Math.round(karensavdrag * 100) / 100;
};

// Beräknar sjuklön för antal dagar
export const beräknaSjuklön = (
  månadslön: number,
  antalDagar: number,
  arbetsdagarPerMånad: number = 22
): number => {
  const daglön = månadslön / arbetsdagarPerMånad;
  const dagsjuklön = daglön * 0.8; // 80% av daglön
  return Math.round(dagsjuklön * antalDagar * 100) / 100;
};
//#endregion

//#region Formatering
// Formaterar belopp som svenska kronor
export const formateraKrona = (belopp: number): string => {
  return `${belopp.toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kr`;
};
//#endregion

//#region Test/exempel
// Exempel på karensberäkning
export const testKarensberäkning = () => {
  const månadslön = 35000;
  console.log(`Månadslön: ${formateraKrona(månadslön)}`);
  console.log(`Veckolön: ${formateraKrona(beräknaVeckolön(månadslön))}`);
  console.log(`Veckosjuklön: ${formateraKrona(beräknaVeckosjuklön(beräknaVeckolön(månadslön)))}`);
  console.log(`Karensavdrag: ${formateraKrona(beräknaKarensavdrag(månadslön))}`);
};
//#endregion
