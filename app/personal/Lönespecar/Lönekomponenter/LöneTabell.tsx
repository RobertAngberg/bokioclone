import LöneRadItem from "./LöneRadItem";

interface LöneTabellProps {
  beräknadeVärden: {
    lönekostnad: number;
    socialaAvgifter: number;
    bruttolön: number;
    skatt: number;
    nettolön: number;
  };
  extrarader: any[];
  onTaBortExtrarad: (id: number) => void;
}

export default function LöneTabell({
  beräknadeVärden,
  extrarader,
  onTaBortExtrarad,
}: LöneTabellProps) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left text-gray-400">Benämning</th>
          <th className="text-center text-gray-400"></th>
          <th className="text-right text-gray-400">Belopp</th>
        </tr>
      </thead>
      <tbody>
        <LöneRadItem benämning="Lönekostnad" belopp={beräknadeVärden.lönekostnad} typ="total" />

        <LöneRadItem benämning="Bruttolön" belopp={beräknadeVärden.bruttolön} typ="total" />

        <LöneRadItem
          benämning="sociala avgifter"
          belopp={beräknadeVärden.socialaAvgifter}
          typ="varav"
        />

        <LöneRadItem benämning="Skatt" belopp={beräknadeVärden.skatt} typ="varav" />

        {/* EXTRARADER */}
        {extrarader.map((rad, i) => {
          const antal = parseFloat(rad.kolumn2) || 1;
          const aSek = parseFloat(rad.kolumn3) || 0;
          const belopp = antal * aSek;

          return (
            <LöneRadItem
              key={rad.id || i}
              benämning={rad.kolumn1 || ""}
              belopp={belopp || 0}
              typ="extrarad"
              kommentar={rad.kolumn4}
              onTaBort={() => onTaBortExtrarad(rad.id)}
            />
          );
        })}

        {/* NETTOLÖN - VISA ALLTID */}
        <LöneRadItem benämning="Nettolön" belopp={beräknadeVärden.nettolön} typ="netto" />
      </tbody>
    </table>
  );
}
