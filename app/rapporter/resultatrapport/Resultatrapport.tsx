//#region: Huvud
import AnimeradFlik from "../../_components/AnimeradFlik";
import MainLayout from "../../_components/MainLayout";
import Totalrad from "./Totalrad";

type Konto = {
  kontonummer: string;
  beskrivning: string;
  [year: string]: number | string;
};

type KontoRad = {
  namn: string;
  konton: Konto[];
  summering: { [year: string]: number };
};

type ResultatData = {
  intakter: KontoRad[];
  rorelsensKostnader: KontoRad[];
  finansiellaKostnader: KontoRad[];
  ar: string[];
};

type Props = {
  initialData: ResultatData;
};
//#endregion

export default function Resultatrapport({ initialData }: Props) {
  const data = initialData;

  const summering = (rader: KontoRad[]) => {
    const result: Record<string, number> = {};
    for (const rad of rader) {
      for (const year of data.ar) {
        const value = typeof rad.summering[year] === "number" ? rad.summering[year] : 0;
        result[year] = (result[year] || 0) + value;
      }
    }
    return result;
  };

  const intaktsSum = summering(data.intakter); // ex: -800
  const rorelsensSum = summering(data.rorelsensKostnader); // ex: 800
  const finansiellaSum = summering(data.finansiellaKostnader); // ex: 0

  const resultat: Record<string, number> = {};
  const resultatEfterFinansiella: Record<string, number> = {};

  data.ar.forEach((year) => {
    const intakt = intaktsSum[year] ?? 0;
    const kostnad = rorelsensSum[year] ?? 0;
    const finansiell = finansiellaSum[year] ?? 0;

    resultat[year] = intakt + kostnad;
    resultatEfterFinansiella[year] = resultat[year] + finansiell;
  });

  const renderGrupper = (rader: KontoRad[], isCost = false, icon?: string) =>
    rader.map((grupp) => (
      <AnimeradFlik key={grupp.namn} title={grupp.namn} icon={icon || (isCost ? "💸" : "💰")}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 pl-6">Konto</th>
              {data.ar.map((year) => (
                <th key={year} className="text-right py-2 pr-6">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grupp.konton.map((konto) => (
              <tr key={konto.kontonummer} className="border-t border-slate-700">
                <td className="py-2 pl-6 pr-4">
                  {konto.kontonummer} – {konto.beskrivning}
                </td>
                {data.ar.map((year) => (
                  <td key={year} className="py-2 pr-6 text-right">
                    {typeof konto[year] === "number"
                      ? Math.abs(konto[year] as number).toLocaleString("sv-SE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) + " kr"
                      : "–"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="font-semibold border-t border-slate-600">
              <td className="py-2 pl-6 pr-4">Summa {grupp.namn}</td>
              {data.ar.map((year) => (
                <td key={year} className="py-2 pr-6 text-right">
                  {Math.abs(grupp.summering[year] ?? 0).toLocaleString("sv-SE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  kr
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </AnimeradFlik>
    ));

  return (
    <MainLayout>
      <h1 className="text-3xl text-center mb-8">Resultatrapport</h1>

      {renderGrupper(data.intakter, false, "💰")}
      <Totalrad
        label="Summa rörelsens intäkter"
        values={Object.fromEntries(data.ar.map((year) => [year, Math.abs(intaktsSum[year] ?? 0)]))}
      />

      <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
      {renderGrupper(data.rorelsensKostnader, true, "💸")}
      <Totalrad
        label="Summa rörelsens kostnader"
        values={Object.fromEntries(
          data.ar.map((year) => [year, Math.abs(rorelsensSum[year] ?? 0)])
        )}
        isCost
      />

      <h2 className="text-xl font-semibold mt-10 mb-4">Finansiella kostnader</h2>
      {renderGrupper(data.finansiellaKostnader, true, "💸")}
      <Totalrad
        label="Summa finansiella kostnader"
        values={Object.fromEntries(
          data.ar.map((year) => [year, Math.abs(finansiellaSum[year] ?? 0)])
        )}
        isCost
      />

      <h2 className="text-xl font-semibold mt-10 mb-4">Resultat</h2>
      <Totalrad label="Summa rörelsens resultat" values={resultat} />
      <Totalrad label="Resultat efter finansiella poster" values={resultatEfterFinansiella} />
      <Totalrad label="Beräknat resultat" values={resultatEfterFinansiella} />
    </MainLayout>
  );
}
