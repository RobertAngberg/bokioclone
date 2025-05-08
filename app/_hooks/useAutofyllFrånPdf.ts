import { useEffect } from "react";

interface Props {
  extractedBelopp?: number | null;
  setBelopp: (v: number) => void;
  currentBelopp: number;
  extractedDatum?: string | null;
  setDatum: (v: string) => void;
  currentDatum: string;
}

export function useAutofyllFrånPdf({
  extractedBelopp,
  setBelopp,
  currentBelopp,
  extractedDatum,
  setDatum,
  currentDatum,
}: Props) {
  useEffect(() => {
    if (extractedBelopp != null && currentBelopp === 0) {
      setBelopp(extractedBelopp);
    }
    if (extractedDatum && currentDatum === "") {
      setDatum(extractedDatum);
    }
  }, [extractedBelopp, extractedDatum, currentBelopp, currentDatum, setBelopp, setDatum]);
}
