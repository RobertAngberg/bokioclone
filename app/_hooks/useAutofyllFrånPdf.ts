import { useEffect } from "react";

type UseAutofyllFrånPdfProps = {
  belopp?: number | null;
  beloppState: [number, (v: number) => void];

  transaktionsdatum?: string | null;
  dateState: [string, (v: string) => void];
};

export function useAutofyllFrånPdf({
  belopp,
  beloppState,
  transaktionsdatum,
  dateState,
}: UseAutofyllFrånPdfProps) {
  const [beloppValue, setBelopp] = beloppState;
  const [dateValue, setDate] = dateState;

  useEffect(() => {
    if (belopp != null && beloppValue === 0) {
      setBelopp(belopp);
    }
  }, [belopp, beloppValue, setBelopp]);

  useEffect(() => {
    if (transaktionsdatum && dateValue === "") {
      setDate(transaktionsdatum);
    }
  }, [transaktionsdatum, dateValue, setDate]);
}
