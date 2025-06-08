// #region Huvud
"use client";

import { useState, useEffect } from "react";
import Knapp from "../_components/Knapp";
import Personalinformation from "./Personalinformation";
import Kompensation from "./Kompensation";
import Tjänsteställe from "./Tjänsteställe";
import Skatt from "./Skatt";
import { sparaAnställd, hämtaAllaAnställda, hämtaAnställd, taBortAnställd } from "./actions";

interface AnställdaProps {
  onAnställdVald: (anställd: any) => void;
  onLäggTillAnställd: () => void;
  visaFormulär: boolean;
  onAvbryt: () => void;
}
// #endregion

export default function Anställda({
  onAnställdVald,
  onLäggTillAnställd,
  visaFormulär,
  onAvbryt,
}: AnställdaProps) {
  // #region State - samma som innan
  const [anställdaLista, setAnställdaLista] = useState<any[]>([]);
  const [redigerarId, setRedigerarId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [personalData, setPersonalData] = useState({
    förnamn: "",
    efternamn: "",
    personnummer: "",
    jobbtitel: "",
    clearingnummer: "",
    bankkonto: "",
    mail: "",
    adress: "",
    postnummer: "",
    ort: "",
  });

  // Alla andra state variabler samma som innan...
  const [startdatum, setStartdatum] = useState<Date>(new Date());
  const [förnyaKontrakt, setFörnyaKontrakt] = useState<Date>(() => {
    const datum = new Date();
    datum.setFullYear(datum.getFullYear() + 1);
    return datum;
  });

  const [anställningstyp, setAnställningstyp] = useState("");
  const [löneperiod, setLöneperiod] = useState("");
  const [ersättningPer, setErsättningPer] = useState("");
  const [arbetsbelastning, setArbetsbelastning] = useState("");

  const [kompensation, setKompensation] = useState("");
  const [arbetsvecka, setArbetsvecka] = useState("");
  const [deltidProcent, SetDeltidProcent] = useState("");

  const [tjänsteställeAdress, setTjänsteställeAdress] = useState("");
  const [tjänsteställeOrt, setTjänsteställeOrt] = useState("");

  const [skattetabell, setSkattetabell] = useState("");
  const [skattekolumn, setSkattekolumn] = useState("");
  const [växaStöd, setVäxaStöd] = useState(false);
  // #endregion

  // #region Alla andra funktioner samma som innan...
  useEffect(() => {
    laddaAnställda();
  }, []);

  const laddaAnställda = async () => {
    setLoading(true);
    try {
      const anställda = await hämtaAllaAnställda();
      setAnställdaLista(anställda);
    } catch (error) {
      console.error("Fel vid laddning av anställda:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnställdKlick = async (anställd: any) => {
    try {
      const fullData = await hämtaAnställd(anställd.id);
      onAnställdVald(fullData);
    } catch (error) {
      console.error("Fel vid laddning av anställd:", error);
      onAnställdVald(anställd);
    }
  };

  const laddaAnställdForRedigering = async (id: number) => {
    try {
      const anställd = await hämtaAnställd(id);
      if (anställd) {
        setPersonalData({
          förnamn: anställd.förnamn || "",
          efternamn: anställd.efternamn || "",
          personnummer: anställd.personnummer || "",
          jobbtitel: anställd.jobbtitel || "",
          clearingnummer: anställd.clearingnummer || "",
          bankkonto: anställd.bankkonto || "",
          mail: anställd.mail || "",
          adress: anställd.adress || "",
          postnummer: anställd.postnummer || "",
          ort: anställd.ort || "",
        });

        if (anställd.startdatum) setStartdatum(new Date(anställd.startdatum));
        if (anställd.förnya_kontrakt) setFörnyaKontrakt(new Date(anställd.förnya_kontrakt));

        setAnställningstyp(anställd.anställningstyp || "");
        setLöneperiod(anställd.löneperiod || "");
        setErsättningPer(anställd.ersättning_per || "");
        setArbetsbelastning(anställd.arbetsbelastning || "");

        setKompensation(anställd.kompensation?.toString() || "");
        setArbetsvecka(anställd.arbetsvecka_timmar?.toString() || "");
        SetDeltidProcent(anställd.deltid_procent?.toString() || "");
        setTjänsteställeAdress(anställd.tjänsteställe_adress || "");
        setTjänsteställeOrt(anställd.tjänsteställe_ort || "");
        setSkattetabell(anställd.skattetabell?.toString() || "");
        setSkattekolumn(anställd.skattekolumn?.toString() || "");
        setVäxaStöd(anställd.växa_stöd || false);

        setRedigerarId(id);
      }
    } catch (error) {
      console.error("Fel vid laddning av anställd:", error);
      alert("Kunde inte ladda anställd");
    }
  };

  const handleTaBort = async (id: number, namn: string) => {
    if (confirm(`Är du säker på att du vill ta bort ${namn}?`)) {
      try {
        const result = await taBortAnställd(id);
        if (result.success) {
          alert("Anställd borttagen!");
          await laddaAnställda();
        } else {
          alert("Fel: " + result.error);
        }
      } catch (error) {
        console.error("Fel vid borttagning:", error);
        alert("Ett fel uppstod");
      }
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpara = async () => {
    console.log("🚀 Sparar anställd...");

    const data = {
      förnamn: personalData.förnamn,
      efternamn: personalData.efternamn,
      personnummer: personalData.personnummer,
      jobbtitel: personalData.jobbtitel,
      mail: personalData.mail,
      clearingnummer: personalData.clearingnummer,
      bankkonto: personalData.bankkonto,
      adress: personalData.adress,
      postnummer: personalData.postnummer,
      ort: personalData.ort,
      startdatum: startdatum.toISOString().split("T")[0],
      förnyaKontrakt: förnyaKontrakt.toISOString().split("T")[0],
      anställningstyp,
      löneperiod,
      ersättningPer,
      kompensation,
      arbetsvecka,
      arbetsbelastning,
      deltidProcent,
      tjänsteställeAdress,
      tjänsteställeOrt,
      skattetabell,
      skattekolumn,
      växaStöd,
    };

    try {
      const result = await sparaAnställd(data, redigerarId);

      if (result.success) {
        alert(result.message);
        await laddaAnställda();
        handleAvbryt();
      } else {
        alert("Fel: " + result.error);
      }
    } catch (error) {
      console.error("Sparfel:", error);
      alert("Ett fel uppstod vid sparande");
    }
  };

  const handleAvbryt = () => {
    setRedigerarId(null);
    setPersonalData({
      förnamn: "",
      efternamn: "",
      personnummer: "",
      jobbtitel: "",
      clearingnummer: "",
      bankkonto: "",
      mail: "",
      adress: "",
      postnummer: "",
      ort: "",
    });
    // Återställ alla andra fält också
    setStartdatum(new Date());
    setFörnyaKontrakt(() => {
      const datum = new Date();
      datum.setFullYear(datum.getFullYear() + 1);
      return datum;
    });
    setAnställningstyp("");
    setLöneperiod("");
    setErsättningPer("");
    setArbetsbelastning("");
    setKompensation("");
    setArbetsvecka("");
    SetDeltidProcent("");
    setTjänsteställeAdress("");
    setTjänsteställeOrt("");
    setSkattetabell("");
    setSkattekolumn("");
    setVäxaStöd(false);

    // Skicka till parent för att dölja andra komponenter
    onAvbryt();
  };
  // #endregion

  return (
    <div className="space-y-6">
      {!visaFormulär ? (
        // Visa lista och "Lägg till"-knapp
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl text-white font-semibold">Sparade anställda</h3>
            <Knapp text="Lägg till anställd" onClick={onLäggTillAnställd} />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <span className="ml-3 text-white">Laddar anställda...</span>
            </div>
          ) : anställdaLista.length === 0 ? (
            <p className="text-gray-400">Inga anställda sparade än.</p>
          ) : (
            <div className="space-y-2">
              {anställdaLista.map((anställd: any) => (
                <div
                  key={anställd.id}
                  className="flex justify-between items-center bg-slate-700 p-3 rounded cursor-pointer hover:bg-slate-600 group"
                >
                  <div onClick={() => handleAnställdKlick(anställd)} className="flex-1">
                    <span className="text-white">
                      {anställd.förnamn} {anställd.efternamn} -{" "}
                      {anställd.jobbtitel || "Ingen titel"}
                    </span>
                    <div className="text-gray-400 text-sm">
                      {new Date(anställd.skapad).toLocaleDateString()}
                    </div>
                  </div>
                  <Knapp
                    text="Ta bort"
                    onClick={() =>
                      handleTaBort(anställd.id, `${anställd.förnamn} ${anställd.efternamn}`)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Visa formulär
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">
              {redigerarId ? "Redigera anställd" : "Ny anställd"}
            </h3>
          </div>

          <Personalinformation personalData={personalData} handleChange={handleChange} />

          <Kompensation
            startdatum={startdatum}
            setStartdatum={setStartdatum}
            förnyaKontrakt={förnyaKontrakt}
            setFörnyaKontrakt={setFörnyaKontrakt}
            anställningstyp={anställningstyp}
            setAnställningstyp={setAnställningstyp}
            löneperiod={löneperiod}
            setLöneperiod={setLöneperiod}
            ersättningPer={ersättningPer}
            setErsättningPer={setErsättningPer}
            kompensation={kompensation}
            setKompensation={setKompensation}
            arbetsvecka={arbetsvecka}
            setArbetsvecka={setArbetsvecka}
            arbetsbelastning={arbetsbelastning}
            setArbetsbelastning={setArbetsbelastning}
            deltidProcent={deltidProcent}
            SetDeltidProcent={SetDeltidProcent}
          />

          <Tjänsteställe
            tjänsteställeAdress={tjänsteställeAdress}
            setTjänsteställeAdress={setTjänsteställeAdress}
            tjänsteställeOrt={tjänsteställeOrt}
            setTjänsteställeOrt={setTjänsteställeOrt}
          />

          <Skatt
            skattetabell={skattetabell}
            setSkattetabell={setSkattetabell}
            skattekolumn={skattekolumn}
            setSkattekolumn={setSkattekolumn}
            växaStöd={växaStöd}
            setVäxaStöd={setVäxaStöd}
          />

          <div className="flex gap-4 pt-4">
            <Knapp text={redigerarId ? "Uppdatera" : "Spara"} onClick={handleSpara} />
            <Knapp text="Avbryt" onClick={handleAvbryt} />
          </div>
        </div>
      )}
    </div>
  );
}
