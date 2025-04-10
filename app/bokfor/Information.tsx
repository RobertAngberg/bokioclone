"use client";

import { useEffect } from "react";
import React from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { sv } from "date-fns/locale/sv";
registerLocale("sv", sv);
import "react-datepicker/dist/react-datepicker.css";

interface InformationProps {
  belopp: number;
  setBelopp: (value: number) => void;
  transaktionsdatum: string | null;
  setTransaktionsdatum: (value: string) => void;
}

function Information({
  belopp,
  setBelopp,
  transaktionsdatum,
  setTransaktionsdatum,
}: InformationProps) {
  useEffect(() => {
    const datePickerEl = document.querySelector(".react-datepicker-wrapper");
    if (datePickerEl) {
      (datePickerEl as HTMLElement).style.width = "100%";
    }

    const inputEl = document.querySelector(".react-datepicker__input-container input");
    if (inputEl) {
      (inputEl as HTMLElement).style.width = "100%";
    }

    // Förifyll dagens datum om null
    if (!transaktionsdatum) {
      setTransaktionsdatum(new Date().toISOString());
    }

    // Förifyll belopp 1000 om 0 eller null
    if (!belopp || belopp === 0) {
      setBelopp(1000);
    }
  }, [transaktionsdatum, belopp, setTransaktionsdatum, setBelopp]);

  return (
    <div className="padder">
      <label htmlFor="belopp" className="block mb-2">
        Belopp:
      </label>
      <input
        className="w-full p-2 mb-4 text-black border-2 border-gray-600 border-solid rounded"
        type="number"
        id="belopp"
        name="belopp"
        required
        value={belopp}
        onChange={(e) => setBelopp(Number(e.target.value))}
      />

      <label htmlFor="datum" className="block mb-2">
        Betaldatum (ÅÅÅÅ-MM-DD):
      </label>
      <DatePicker
        className="w-full p-2 mb-4 text-black border-2 border-gray-600 border-solid rounded"
        id="datum"
        selected={transaktionsdatum ? new Date(transaktionsdatum) : new Date()}
        onChange={(date) => {
          setTransaktionsdatum(date ? date.toISOString() : "");
        }}
        dateFormat="yyyy-MM-dd"
        locale="sv"
        required
      />
    </div>
  );
}

export { Information };
