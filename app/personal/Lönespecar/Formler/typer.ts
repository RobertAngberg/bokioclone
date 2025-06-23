export interface LöneKontrakt {
  månadslön: number;
  arbetstimmarPerVecka: number;
  skattetabell: string;
  skattekolumn: number;
  kommunalSkatt: number;
  socialaAvgifterSats: number;
}

export interface DagAvdrag {
  föräldraledighet: number;
  vårdAvSjuktBarn: number;
  sjukfrånvaro: number;
}

export type BilTyp = "bensinDiesel" | "el";

export interface Extrarad {
  kolumn1: string; // Benämning
  kolumn2: string; // Antal
  kolumn3: string; // Belopp
  kolumn4?: string; // Kommentar
}
