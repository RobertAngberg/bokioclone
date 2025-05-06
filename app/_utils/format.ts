// formaterar ett tal till svenskt format med två decimaler, t.ex. "1 234,00"
export const formatSEK = (v: number): string =>
  v.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

// rundar ett tal till två decimaler
export const round = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100;

// konverterar en sträng med , eller . till ett tal, returnerar 0 om fel
export const parseNumber = (s: string): number => parseFloat(s.replace(",", ".")) || 0;
