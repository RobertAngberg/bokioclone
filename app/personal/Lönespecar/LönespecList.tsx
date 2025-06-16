//#region Huvud
import LönespecCard from "./LönespecCard";

interface LönespecListProps {
  lönespecar: any[];
  anställd: any;
  utlägg: any[];
  onFörhandsgranskning: (id: string) => void;
  onBeräkningarUppdaterade: (lönespecId: string, beräkningar: any) => void;
  beräknadeVärden: any;
}

export default function LönespecList({
  lönespecar,
  anställd,
  utlägg,
  onFörhandsgranskning,
  onBeräkningarUppdaterade,
  beräknadeVärden,
}: LönespecListProps) {
  //#endregion

  //#region Render
  if (lönespecar.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Inga lönespecifikationer hittades för {anställd.förnamn} {anställd.efternamn}.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {lönespecar.map((lönespec) => (
        <LönespecCard
          key={lönespec.id}
          lönespec={lönespec}
          anställd={anställd}
          utlägg={utlägg}
          onFörhandsgranskning={onFörhandsgranskning}
          onBeräkningarUppdaterade={onBeräkningarUppdaterade}
          beräknadeVärden={beräknadeVärden}
        />
      ))}
    </div>
  );
  //#endregion
}
