//#region: Huvud
import AnimeradFlik from "@/_components/AnimeradFlik";
import MainLayout from "@/_components/MainLayout";
import Totalrad from "./Totalrad";

// Datatyper
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
  kostnader: KontoRad[];
  ar: string[];
};

type Props = {
  initialData: ResultatData;
};
//#endregion

export default function Resultatrapport({ initialData }: Props) {
  const data = initialData;

  // Summerar alla belopp per år för ett givet block (intäkter eller kostnader)
  const summering = (rader: KontoRad[]) => {
    const result: Record<string, number> = {};
    for (const rad of rader) {
      for (const year of data.ar) {
        result[year] = (result[year] || 0) + (rad.summering[year] || 0);
      }
    }
    return result;
  };

  const intaktsSum = summering(data.intakter);
  const kostnadsSum = summering(data.kostnader);
  const resultat = data.ar.map((year) => intaktsSum[year] - kostnadsSum[year]);

  // Renderar varje grupp (t.ex. "Försäljning", "Personalkostnader") med AnimeradFlik
  const renderGrupper = (rader: KontoRad[], isCost = false) =>
    rader.map((grupp) => (
      <AnimeradFlik key={grupp.namn} title={grupp.namn}>
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
                      ? (konto[year] as number).toLocaleString("sv-SE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) + " kr"
                      : "–"}
                  </td>
                ))}
              </tr>
            ))}
            {/* Summa-rad för varje grupp */}
            <tr className="font-semibold border-t border-slate-600">
              <td className="py-2 pl-6 pr-4">Summa {grupp.namn}</td>
              {data.ar.map((year) => (
                <td key={year} className="py-2 pr-6 text-right">
                  {grupp.summering[year].toLocaleString("sv-SE", {
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

      {/* Intäktsgrupper och totalsumma */}
      {renderGrupper(data.intakter)}
      <Totalrad label="Summa rörelsens intäkter" values={intaktsSum} />

      {/* Kostnadsgrupper och totalsumma */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
      {renderGrupper(data.kostnader, true)}
      <Totalrad label="Summa rörelsens kostnader" values={kostnadsSum} isCost />

      {/* Resultat-rader */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Resultat</h2>
      {["Summa rörelsens resultat", "Resultat efter finansiella poster", "Beräknat resultat"].map(
        (label) => (
          <Totalrad
            key={label}
            label={label}
            values={data.ar.reduce(
              (acc, year, i) => ({ ...acc, [year]: resultat[i] }),
              {} as Record<string, number>
            )}
          />
        )
      )}
    </MainLayout>
  );
}
