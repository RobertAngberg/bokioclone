"use client";

import { useEffect, useState } from "react";
import { hämtaFörvalMedSökning, räknaFörval, taBortFörval, uppdateraFörval } from "./start/actions";

type KontoRad = {
  kontonummer: string;
  beskrivning?: string;
  label?: string;
  debet?: boolean;
  kredit?: boolean;
};

type Förval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  extrafält?: KontoRad[];
  sökord: string[];
  momssats: number | null;
  specialtyp: string | null;
};

export default function ForvalDatabas() {
  const [data, setData] = useState<Förval[]>([]);
  const [sida, setSida] = useState(1);
  const [sök, setSök] = useState("");
  const [total, setTotal] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editId, setEditId] = useState<number | null>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const perPage = 1;

  useEffect(() => {
    const fetch = async () => {
      if (sök.trim().length < 2) {
        setData([]);
        setTotal(0);
        return;
      }
      const resultat = await hämtaFörvalMedSökning(sök, (sida - 1) * perPage, perPage);
      const antal = await räknaFörval(sök);
      setData(resultat);
      setTotal(antal);
    };
    fetch();
  }, [sida, sök]);

  const totalPages = Math.ceil(total / perPage);

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Ta bort denna förval?");
    if (!confirm) return;
    await taBortFörval(id);
    setData((prev) => prev.filter((rad) => rad.id !== id));
  };

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const handleCellClick = (id: number, field: keyof Förval, value: any) => {
    setEditId(id);
    setEditField(field);
    setEditValue(value?.toString() ?? "");
  };

  const handleBlur = async () => {
    if (editId !== null && editField !== null) {
      await uppdateraFörval(editId, editField, editValue);
      setData((prev) =>
        prev.map((rad) => (rad.id === editId ? { ...rad, [editField]: editValue } : rad))
      );
    }
    setEditId(null);
    setEditField(null);
  };

  return (
    <main className="px-6 pt-10 text-white">
      <h1 className="mb-6 text-3xl font-bold text-center">Förval-databas</h1>

      <div className="flex justify-center mb-0">
        <input
          type="text"
          placeholder="🔍 Sök förval..."
          value={sök}
          onChange={(e) => {
            setSök(e.target.value);
            setSida(1);
          }}
          className="mb-2 w-[400px] px-4 py-2 rounded bg-slate-800 text-white placeholder-gray-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {data.length > 0 && (
        <>
          <table className="w-full text-sm border border-gray-700">
            <thead className="text-left">
              <tr>
                <th className="px-3 py-6">ID</th>
                <th className="px-3 py-4">Namn</th>
                <th className="px-3 py-4">Beskrivning</th>
                <th className="px-3 py-4">Typ</th>
                <th className="px-3 py-4">Kategori</th>
                <th className="px-3 py-4">Sökord</th>
                <th className="px-3 py-4">Moms</th>
                <th className="px-3 py-4">Specialtyp</th>
                <th className="px-3 py-4">Konton</th>
                <th className="px-3 py-4">❌</th>
              </tr>
            </thead>

            <tbody>
              {data.flatMap((rad, i) => {
                const isEven = i % 2 === 0;
                const rowBg = isEven ? "bg-slate-800" : "bg-slate-850";
                const isExpanded = expandedRows.has(rad.id);

                const renderCell = (field: keyof Förval, value: any) => {
                  const isEditing = editId === rad.id && editField === field;

                  if (isEditing) {
                    return (
                      <input
                        className="w-full px-2 py-1 rounded bg-slate-800 text-white"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleBlur}
                        autoFocus
                      />
                    );
                  }

                  const display =
                    Array.isArray(value) && typeof value[0] === "string"
                      ? value.join(", ")
                      : (value ?? "-");

                  return (
                    <div
                      onClick={() => handleCellClick(rad.id, field, value)}
                      className="cursor-pointer"
                    >
                      {display}
                    </div>
                  );
                };

                return [
                  <tr key={rad.id} className={`${rowBg} align-top text-sm`}>
                    <td className="p-3 text-left">{rad.id}</td>
                    <td className="p-3 text-left">{renderCell("namn", rad.namn)}</td>
                    <td className="p-3 text-left">{renderCell("beskrivning", rad.beskrivning)}</td>
                    <td className="p-3 text-left">{renderCell("typ", rad.typ)}</td>
                    <td className="p-3 text-left">{renderCell("kategori", rad.kategori)}</td>
                    <td className="p-3 text-left">{renderCell("sökord", rad.sökord)}</td>
                    <td className="p-3 text-left">{renderCell("momssats", rad.momssats)}</td>
                    <td className="p-3 text-left">{renderCell("specialtyp", rad.specialtyp)}</td>
                    <td className="p-3 text-left">
                      <button
                        onClick={() => toggleExpand(rad.id)}
                        className="text-cyan-300 hover:underline text-sm"
                      >
                        {isExpanded ? "Dölj" : "Visa"}
                      </button>
                    </td>
                    <td className="p-3 text-left">
                      <button
                        onClick={() => handleDelete(rad.id)}
                        className="text-red-500 hover:underline text-sm"
                      >
                        X
                      </button>
                    </td>
                  </tr>,

                  isExpanded && (
                    <tr key={`exp-${rad.id}`} className={rowBg}>
                      <td colSpan={10}>
                        <div className="border-b-4 border-slate-600 pb-4 mb-10 flex flex-wrap justify-center gap-3 px-4 pt-4">
                          {[...(rad.konton || []), ...(rad.extrafält || [])].map(
                            (konto: any, idx) => (
                              <div
                                key={idx}
                                className="p-3 border border-slate-700 rounded bg-slate-800 min-w-[220px]"
                              >
                                <p className="mb-1 font-bold">
                                  {konto.kontonummer} –{" "}
                                  {konto.beskrivning ?? konto.label ?? "Saknas"}
                                </p>
                                <p className="text-xs text-gray-300">
                                  Debet: {konto.debet ? "✓" : "–"} | Kredit:{" "}
                                  {konto.kredit ? "✓" : "–"}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                ].filter(Boolean);
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-center mt-6 space-x-4">
            <button
              disabled={sida === 1}
              onClick={() => setSida(sida - 1)}
              className="px-3 py-2 text-sm bg-slate-800 rounded disabled:opacity-30"
            >
              ◀ Föregående
            </button>
            <span>
              Sida {sida} av {totalPages}
            </span>
            <button
              disabled={sida === totalPages}
              onClick={() => setSida(sida + 1)}
              className="px-3 py-2 text-sm bg-slate-800 rounded disabled:opacity-30"
            >
              Nästa ▶
            </button>
          </div>
        </>
      )}
    </main>
  );
}
