"use client";

import React, { useState } from "react";
import Tabell, { ColumnDefinition } from "../../_components/Tabell";

type MomsRad = {
  fält: string;
  beskrivning: string;
  belopp: number;
};

type Props = {
  initialData: MomsRad[];
};

const allaFält: MomsRad[] = [
  // 🧾 Block A
  { fält: "05", beskrivning: "Momspliktig försäljning", belopp: 0 },
  { fält: "06", beskrivning: "Momspliktiga uttag", belopp: 0 },
  { fält: "07", beskrivning: "Vinstmarginalbeskattning", belopp: 0 },
  { fält: "08", beskrivning: "Hyresinkomster med frivillig moms", belopp: 0 },

  // 💸 Block B
  { fält: "10", beskrivning: "Utgående moms 25%", belopp: 0 },
  { fält: "11", beskrivning: "Utgående moms 12%", belopp: 0 },
  { fält: "12", beskrivning: "Utgående moms 6%", belopp: 0 },

  // 📦 Block C
  { fält: "20", beskrivning: "Inköp varor från annat EU-land", belopp: 0 },
  { fält: "21", beskrivning: "Inköp tjänster från EU-land", belopp: 0 },
  { fält: "22", beskrivning: "Inköp tjänster från land utanför EU", belopp: 0 },
  { fält: "23", beskrivning: "Inköp varor i Sverige (omvänd moms)", belopp: 0 },
  { fält: "24", beskrivning: "Inköp tjänster i Sverige (omvänd moms)", belopp: 0 },

  // 💸 Block D
  { fält: "30", beskrivning: "Utgående moms 25% (omvänd moms)", belopp: 0 },
  { fält: "31", beskrivning: "Utgående moms 12% (omvänd moms)", belopp: 0 },
  { fält: "32", beskrivning: "Utgående moms 6% (omvänd moms)", belopp: 0 },

  // 🚢 Block H
  { fält: "50", beskrivning: "Beskattningsunderlag vid import", belopp: 0 },

  // I
  { fält: "60", beskrivning: "Utgående moms 25% (import)", belopp: 0 },
  { fält: "61", beskrivning: "Utgående moms 12% (import)", belopp: 0 },
  { fält: "62", beskrivning: "Utgående moms 6% (import)", belopp: 0 },

  // 🚫 Block E
  { fält: "35", beskrivning: "Varuförsäljning till EU-land", belopp: 0 },
  { fält: "36", beskrivning: "Export varor utanför EU", belopp: 0 },
  { fält: "37", beskrivning: "3-partshandel inköp", belopp: 0 },
  { fält: "38", beskrivning: "3-partshandel försäljning", belopp: 0 },
  { fält: "39", beskrivning: "Tjänst till EU (huvudregel)", belopp: 0 },
  { fält: "40", beskrivning: "Tjänst till utanför EU", belopp: 0 },
  { fält: "41", beskrivning: "Försäljning med omvänd moms", belopp: 0 },
  { fält: "42", beskrivning: "Övrigt momsundantaget", belopp: 0 },

  // ✅ Block F
  { fält: "48", beskrivning: "Ingående moms att dra av", belopp: 0 },

  // ⚖️ Block G
  { fält: "49", beskrivning: "Moms att betala eller få tillbaka", belopp: 0 },
];

const columns: ColumnDefinition<MomsRad>[] = [
  { key: "fält", label: "Fält", hiddenOnMobile: false },
  { key: "beskrivning", label: "Beskrivning", hiddenOnMobile: false },
  {
    key: "belopp",
    label: "Belopp",
    render: (value: number) =>
      Number(value) === 0 ? (
        <span className="text-slate-500">–</span>
      ) : (
        `${value.toLocaleString("sv-SE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} kr`
      ),
  },
];

export default function Momsrapport({ initialData }: Props) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const fullData = allaFält.map((fält) => {
    const match = initialData.find((rad) => rad.fält === fält.fält);
    return { ...fält, belopp: match?.belopp ?? 0 };
  });

  const spawnaBlock = (titel: string, fält: string[]) => (
    <div className="min-w-[49%] px-2">
      <h2 className="font-bold mb-2">{titel}</h2>
      <Tabell
        data={fullData.filter((rad) => fält.includes(rad.fält))}
        columns={columns}
        getRowId={(rad: MomsRad) => rad.fält}
        activeId={activeId}
        handleRowClick={(id: string | number) => setActiveId(id)}
      />
    </div>
  );

  return (
    <>
      <h1 className="text-3xl text-center mb-10">Momsrapport för 2025</h1>

      {/* A + B */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {spawnaBlock("A. Momspliktig försäljning eller uttag exkl. moms", ["05", "06", "07", "08"])}
        {spawnaBlock("B. Utgående moms på försäljning eller uttag i ruta 05-08", [
          "10",
          "11",
          "12",
        ])}
      </div>

      {/* C + D */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {spawnaBlock("C. Momspliktiga inköp vid omvänd skattskyldighet", [
          "20",
          "21",
          "22",
          "23",
          "24",
        ])}
        {spawnaBlock("D. Utgående moms på inköp i ruta 20-24", ["30", "31", "32"])}
      </div>

      {/* H + I */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {spawnaBlock("H. Import", ["50"])}
        {spawnaBlock("I. Utgående moms på import i ruta 50", ["60", "61", "62"])}
      </div>

      {/* E + F/G i två kolumner */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {spawnaBlock("E. Försäljning m.m. som är undantagen från moms", [
          "35",
          "36",
          "37",
          "38",
          "39",
          "40",
          "41",
          "42",
        ])}

        {/* En kolumn för både F och G */}
        <div className="w-full md:w-1/2 px-2 flex flex-col gap-6">
          <div className="w-full">{spawnaBlock("F. Ingående moms", ["48"])}</div>
          <div className="w-full">
            {spawnaBlock("G. Moms att betala eller få tillbaka (ifylls alltid)", ["49"])}
          </div>
        </div>
      </div>
    </>
  );
}
