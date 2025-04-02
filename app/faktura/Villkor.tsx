"use client";

import { useState, useEffect } from "react";
import { useFakturaContext } from "./FakturaProvider";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { sv } from "date-fns/locale";

export default function Villkor() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData } = useFakturaContext();

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const fakturadatumDate = new Date(formData.fakturadatum);
  const forfalloDate = new Date(formData.forfallodatum || addDays(fakturadatumDate, 30));

  useEffect(() => {
    const days = parseInt(formData.betalningsvillkor || "30");
    const nyttDatum = addDays(new Date(formData.fakturadatum), days);
    setFormData((prev) => ({
      ...prev,
      forfallodatum: nyttDatum.toISOString().slice(0, 10),
    }));
  }, [formData.fakturadatum, formData.betalningsvillkor, setFormData]);

  const handleFakturadatumChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      fakturadatum: date.toISOString().slice(0, 10),
    }));
  };

  const handleForfallodatumChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      forfallodatum: date.toISOString().slice(0, 10),
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">Villkor</h2>
        <span className="text-white">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="transition-all duration-300 ease-in-out bg-cyan-900 p-6 text-white space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Fakturadatum</label>
              <DatePicker
                selected={fakturadatumDate}
                onChange={handleFakturadatumChange}
                dateFormat="yyyy-MM-dd"
                locale={sv}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Förfallodatum</label>
              <DatePicker
                selected={forfalloDate}
                onChange={handleForfallodatumChange}
                dateFormat="yyyy-MM-dd"
                locale={sv}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Betalningsvillkor (dagar)</label>
              <input
                type="text"
                name="betalningsvillkor"
                value={formData.betalningsvillkor}
                onChange={handleTextChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Dröjsmålsränta</label>
              <input
                type="text"
                name="drojsmalsranta"
                value={formData.drojsmalsranta}
                onChange={handleTextChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Leverans</label>
              <input
                type="text"
                name="leverans"
                value={formData.leverans}
                onChange={handleTextChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
