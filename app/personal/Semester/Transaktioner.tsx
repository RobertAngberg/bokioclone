// #region Huvud
"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropdown from "../../_components/Dropdown";

interface TransaktionerProps {
  anställd?: any;
}

interface Transaktion {
  id: string;
  datum: string;
  typ: string;
  antal: number;
  från?: string;
  till?: string;
  beskrivning?: string;
  lönespecifikation?: string;
}

interface IntjänandeTransaktion {
  id: string;
  datum: string;
  typ: string;
  antal: number;
  beskrivning?: string;
  lönespecifikation?: string;
}
// #endregion

export default function Transaktioner({ anställd }: TransaktionerProps) {
  // #region State
  const [startdatum, setStartdatum] = useState(new Date());
  const [slutdatum, setSlutdatum] = useState(new Date());
  const [filterTyp, setFilterTyp] = useState("Alla");
  const [inkluderaBokfört, setInkluderaBokfört] = useState(false);
  const [transaktioner, setTransaktioner] = useState<Transaktion[]>([]);
  const [intjänandeTransaktioner, setIntjänandeTransaktioner] = useState<IntjänandeTransaktion[]>(
    []
  );
  // #endregion

  // #region Initialize Data
  useEffect(() => {
    if (anställd) {
      // Mock data - ersätt med riktig data från databas
      setTransaktioner([
        {
          id: "1",
          datum: "2025-06-11",
          typ: "Förskott",
          antal: -2,
          beskrivning: "",
          lönespecifikation: "",
        },
        {
          id: "2",
          datum: "2025-06-11",
          typ: "Förskott",
          antal: 4,
          beskrivning: "",
          lönespecifikation: "",
        },
        {
          id: "3",
          datum: "2025-06-11",
          typ: "Sparade",
          antal: 2,
          från: "2024-04-01",
          beskrivning: "",
          lönespecifikation: "",
        },
        {
          id: "4",
          datum: "2025-06-11",
          typ: "Obetald",
          antal: 1,
          beskrivning: "",
          lönespecifikation: "",
        },
        {
          id: "5",
          datum: "2025-06-11",
          typ: "Betalda",
          antal: 10,
          beskrivning: "",
          lönespecifikation: "",
        },
      ]);

      setIntjänandeTransaktioner([
        {
          id: "1",
          datum: "2025-06-11",
          typ: "Intjänat",
          antal: 5,
          beskrivning: "",
          lönespecifikation: "",
        },
      ]);
    }
  }, [anställd]);
  // #endregion

  // #region Dropdown Options
  const typOptions = [
    { value: "Alla", label: "Alla" },
    { value: "Förskott", label: "Förskott" },
    { value: "Sparade", label: "Sparade" },
    { value: "Obetald", label: "Obetald" },
    { value: "Betalda", label: "Betalda" },
    { value: "Intjänat", label: "Intjänat" },
  ];
  // #endregion

  // #region Filtered Data
  const filtreradeTransaktioner = transaktioner.filter((t) => {
    if (filterTyp === "Alla") return true;
    return t.typ === filterTyp;
  });

  const filtreradeIntjänandeTransaktioner = intjänandeTransaktioner.filter((t) => {
    if (filterTyp === "Alla" || filterTyp === "Intjänat") return true;
    return false;
  });
  // #endregion

  return (
    <div className="bg-slate-800 p-6 rounded-lg space-y-6">
      {/* Filter sektion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Startdatum</label>
          <DatePicker
            selected={startdatum}
            onChange={(date) => date && setStartdatum(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Slutdatum</label>
          <DatePicker
            selected={slutdatum}
            onChange={(date) => date && setSlutdatum(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <Dropdown label="Typ" value={filterTyp} onChange={setFilterTyp} options={typOptions} />

        <div className="flex items-end">
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              checked={inkluderaBokfört}
              onChange={(e) => setInkluderaBokfört(e.target.checked)}
              className="mr-2 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
            />
            Inkludera endast bokfört?
          </label>
        </div>
      </div>

      {/* Transaktioner tabell */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Transaktioner</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-white font-medium py-2">Datum</th>
                <th className="text-left text-white font-medium py-2">Typ</th>
                <th className="text-left text-white font-medium py-2">Antal</th>
                <th className="text-left text-white font-medium py-2">Från</th>
                <th className="text-left text-white font-medium py-2">Till</th>
                <th className="text-left text-white font-medium py-2">Beskrivning</th>
                <th className="text-left text-white font-medium py-2">Lönespecifikation</th>
              </tr>
            </thead>
            <tbody>
              {filtreradeTransaktioner.map((transaktion) => (
                <tr key={transaktion.id} className="border-b border-slate-700">
                  <td className="text-white py-2">{transaktion.datum}</td>
                  <td className="text-white py-2">{transaktion.typ}</td>
                  <td className="text-white py-2">
                    {transaktion.antal > 0 ? transaktion.antal : `−${Math.abs(transaktion.antal)}`}
                  </td>
                  <td className="text-white py-2">{transaktion.från || ""}</td>
                  <td className="text-white py-2">{transaktion.till || ""}</td>
                  <td className="text-white py-2">{transaktion.beskrivning || ""}</td>
                  <td className="text-white py-2">{transaktion.lönespecifikation || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaktioner för intjänande tabell */}
      {(filterTyp === "Alla" || filterTyp === "Intjänat") && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Transaktioner för intjänande</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-white font-medium py-2">Datum</th>
                  <th className="text-left text-white font-medium py-2">Typ</th>
                  <th className="text-left text-white font-medium py-2">Antal</th>
                  <th className="text-left text-white font-medium py-2">Beskrivning</th>
                  <th className="text-left text-white font-medium py-2">Lönespecifikation</th>
                </tr>
              </thead>
              <tbody>
                {filtreradeIntjänandeTransaktioner.map((transaktion) => (
                  <tr key={transaktion.id} className="border-b border-slate-700">
                    <td className="text-white py-2">{transaktion.datum}</td>
                    <td className="text-white py-2">{transaktion.typ}</td>
                    <td className="text-white py-2">{transaktion.antal}</td>
                    <td className="text-white py-2">{transaktion.beskrivning || ""}</td>
                    <td className="text-white py-2">{transaktion.lönespecifikation || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
