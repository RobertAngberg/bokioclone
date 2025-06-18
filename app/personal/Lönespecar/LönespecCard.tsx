//#region Huvud
import AnimeradFlik from "../../_components/AnimeradFlik";
import ToppInfo from "./ToppInfo";
import Lönekomponenter from "./Lönekomponenter/Lönekomponenter";
import Utlägg from "./Utlägg";
import Sammanfattning from "./Sammanfattning";
import Knapp from "../../_components/Knapp";
import StatusBadge from "./StatusBadge";

interface LönespecCardProps {
  lönespec: any;
  anställd: any;
  utlägg: any[];
  onFörhandsgranskning: (id: string) => void;
  onBeräkningarUppdaterade: (lönespecId: string, beräkningar: any) => void;
  beräknadeVärden: any;
  ingenAnimering?: boolean;
  onTaBortLönespec?: () => void;
  taBortLoading?: boolean;
}

export default function LönespecCard({
  lönespec,
  anställd,
  utlägg,
  onFörhandsgranskning,
  onBeräkningarUppdaterade,
  beräknadeVärden,
  ingenAnimering,
  onTaBortLönespec,
  taBortLoading,
}: LönespecCardProps) {
  //#endregion

  //#region Helper Functions
  function getMånadsNamn(månad: number, år: number): string {
    const månader = [
      "Januari",
      "Februari",
      "Mars",
      "April",
      "Maj",
      "Juni",
      "Juli",
      "Augusti",
      "September",
      "Oktober",
      "November",
      "December",
    ];
    return `${månader[månad - 1]} ${år}`;
  }
  //#endregion

  //#region Data Processing
  const månadsNamn = getMånadsNamn(lönespec.månad || 1, lönespec.år || 2025);
  const grundlön = parseFloat(lönespec.grundlön || lönespec.bruttolön || 0);
  const övertid = parseFloat(lönespec.övertid || 0);
  const bruttolön = parseFloat(lönespec.bruttolön || 0);
  const socialaAvgifter = parseFloat(lönespec.sociala_avgifter || 0);
  const skatt = parseFloat(lönespec.skatt || 0);
  const nettolön = parseFloat(lönespec.nettolön || 0);
  const utbetalningsDatum = new Date(lönespec.år, (lönespec.månad || 1) - 1, 25);

  // Hämta beräknade värden för denna lönespec
  const aktuellBeräkning = beräknadeVärden[lönespec.id];

  // Använd beräknade värden om de finns, annars fallback till originala
  const visaBruttolön = aktuellBeräkning?.bruttolön ?? bruttolön;
  const visaSkatt = aktuellBeräkning?.skatt ?? skatt;
  const visaNettolön = aktuellBeräkning?.nettolön ?? nettolön;
  const visaSocialaAvgifter = aktuellBeräkning?.socialaAvgifter ?? socialaAvgifter;
  const visaLönekostnad = aktuellBeräkning?.lönekostnad ?? bruttolön + socialaAvgifter;

  const lönespecUtlägg = utlägg.filter(
    (u) => u.lönespecifikation_id === lönespec.id || !u.lönespecifikation_id
  );
  //#endregion

  //#region Render Content
  const innehåll = (
    <div className="space-y-6">
      <ToppInfo
        månadsNamn={månadsNamn}
        lönespec={lönespec}
        anställd={anställd}
        getLönespecStatusBadge={(status: string) => <StatusBadge status={status} type="lönespec" />}
      />

      <Lönekomponenter
        grundlön={grundlön}
        övertid={övertid}
        lönespec={lönespec}
        onBeräkningarUppdaterade={onBeräkningarUppdaterade}
      />

      <Utlägg
        lönespecUtlägg={lönespecUtlägg}
        getStatusBadge={(status: string) => <StatusBadge status={status} type="utlägg" />}
      />

      <Sammanfattning
        utbetalningsDatum={utbetalningsDatum}
        nettolön={visaNettolön}
        lönespec={lönespec}
        anställd={anställd}
        bruttolön={visaBruttolön}
        skatt={visaSkatt}
        socialaAvgifter={visaSocialaAvgifter}
        lönekostnad={visaLönekostnad}
      />

      <div className="flex gap-2 mt-4 justify-center">
        <Knapp text="👁️ Förhandsgranska / PDF" onClick={() => onFörhandsgranskning(lönespec.id)} />

        {onTaBortLönespec && (
          <Knapp
            text="🗑️ Ta bort lönespec"
            loading={taBortLoading}
            loadingText="⏳ Tar bort..."
            onClick={onTaBortLönespec}
          />
        )}
      </div>
    </div>
  );

  // Om ingenAnimering = true, visa bara innehållet direkt
  if (ingenAnimering) {
    return innehåll;
  }

  // Annars visa med AnimeradFlik som vanligt
  return (
    <AnimeradFlik
      key={lönespec.id}
      title={`Lönespec ${månadsNamn}`}
      icon="📅"
      visaSummaDirekt={`Netto: ${visaNettolön.toLocaleString("sv-SE")} kr`}
    >
      {innehåll}
    </AnimeradFlik>
  );
  //#endregion
}
