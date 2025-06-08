// #region Huvud
"use client";

import { useState, useEffect } from "react";
import TextFält from "../_components/TextFält";
import Dropdown from "../_components/Dropdown";
import Knapp from "../_components/Knapp";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { sparaAnställd, hämtaAllaAnställda, hämtaAnställd } from "./actions";
// #endregion

export default function Anställda() {
  // #region State
  const [anställdaLista, setAnställdaLista] = useState<any[]>([]);
  const [redigerarId, setRedigerarId] = useState<number | null>(null);
  const [visaLista, setVisaLista] = useState(false);

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

  // Datumobjekt för kompensation
  const [startdatum, setStartdatum] = useState<Date>(new Date());
  const [förnyaKontrakt, setFörnyaKontrakt] = useState<Date>(() => {
    const datum = new Date();
    datum.setFullYear(datum.getFullYear() + 1);
    return datum;
  });

  // Dropdown-värden
  const [anställningstyp, setAnställningstyp] = useState("");
  const [löneperiod, setLöneperiod] = useState("");
  const [ersättningPer, setErsättningPer] = useState("");
  const [arbetsbelastning, setArbetsbelastning] = useState("");

  // Kompensation och arbetsvecka
  const [kompensation, setKompensation] = useState("");
  const [arbetsvecka, setArbetsvecka] = useState("");
  const [deltidProcent, SetDeltidProcent] = useState("");

  // Tjänsteställe
  const [tjänsteställeAdress, setTjänsteställeAdress] = useState("");
  const [tjänsteställeOrt, setTjänsteställeOrt] = useState("");

  // Skatt
  const [skattetabell, setSkattetabell] = useState("");
  const [skattekolumn, setSkattekolumn] = useState("");
  const [växaStöd, setVäxaStöd] = useState(false);
  // #endregion

  // #region Ladda anställda på mount
  useEffect(() => {
    laddaAnställda();
  }, []);

  const laddaAnställda = async () => {
    try {
      const anställda = await hämtaAllaAnställda();
      setAnställdaLista(anställda);
    } catch (error) {
      console.error("Fel vid laddning av anställda:", error);
    }
  };

  const laddaAnställd = async (id: number) => {
    try {
      const anställd = await hämtaAnställd(id);
      if (anställd) {
        // Fyll i formuläret med data
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

        // Fyll i datum
        if (anställd.startdatum) setStartdatum(new Date(anställd.startdatum));
        if (anställd.förnya_kontrakt) setFörnyaKontrakt(new Date(anställd.förnya_kontrakt));

        // Fyll i dropdowns
        setAnställningstyp(anställd.anställningstyp || "");
        setLöneperiod(anställd.löneperiod || "");
        setErsättningPer(anställd.ersättning_per || "");
        setArbetsbelastning(anställd.arbetsbelastning || "");

        // Fyll i övrig data
        setKompensation(anställd.kompensation?.toString() || "");
        setArbetsvecka(anställd.arbetsvecka_timmar?.toString() || "");
        SetDeltidProcent(anställd.deltid_procent?.toString() || "");
        setTjänsteställeAdress(anställd.tjänsteställe_adress || "");
        setTjänsteställeOrt(anställd.tjänsteställe_ort || "");
        setSkattetabell(anställd.skattetabell?.toString() || "");
        setSkattekolumn(anställd.skattekolumn?.toString() || "");
        setVäxaStöd(anställd.växa_stöd || false);

        setRedigerarId(id);
        setVisaLista(false);
      }
    } catch (error) {
      console.error("Fel vid laddning av anställd:", error);
      alert("Kunde inte ladda anställd");
    }
  };
  // #endregion

  // #region Nytt formulär - ändra till ny anställd?
  // Rensa formuläret och återställa till ny anställd
  const nyttFormulär = () => {
    // Rensa formuläret
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

    setRedigerarId(null);
    setVisaLista(false);
  };
  // #endregion

  // #region Handlers
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
        if (!redigerarId) nyttFormulär();
      } else {
        alert("Fel: " + result.error);
      }
    } catch (error) {
      console.error("Sparfel:", error);
      alert("Ett fel uppstod vid sparande");
    }
  };
  // #endregion

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          {redigerarId ? "Redigera anställd" : "Ny anställd"}
        </h1>
        <div className="flex gap-2">
          <Knapp
            text={visaLista ? "Dölj lista" : "Visa sparade"}
            onClick={() => setVisaLista(!visaLista)}
          />
          <Knapp text="Nytt formulär" onClick={nyttFormulär} />
        </div>
      </div>

      {/* Lista över sparade anställda */}
      {visaLista && (
        <div className="bg-slate-800 p-4 rounded">
          <h3 className="text-xl text-white mb-4">Sparade anställda</h3>
          {anställdaLista.length === 0 ? (
            <p className="text-gray-400">Inga anställda sparade än.</p>
          ) : (
            <div className="space-y-2">
              {anställdaLista.map((anställd: any) => (
                <div
                  key={anställd.id}
                  className="flex justify-between items-center bg-slate-700 p-3 rounded cursor-pointer hover:bg-slate-600"
                  onClick={() => laddaAnställd(anställd.id)}
                >
                  <span className="text-white">
                    {anställd.förnamn} {anställd.efternamn} - {anställd.jobbtitel || "Ingen titel"}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(anställd.skapad).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TextFält
          label="Förnamn"
          name="förnamn"
          type="text"
          value={personalData.förnamn}
          onChange={handleChange}
        />

        <TextFält
          label="Efternamn"
          name="efternamn"
          type="text"
          value={personalData.efternamn}
          onChange={handleChange}
        />

        <TextFält
          label="Personnummer"
          name="personnummer"
          type="text"
          value={personalData.personnummer}
          onChange={handleChange}
        />

        <TextFält
          label="Jobbtitel"
          name="jobbtitel"
          type="text"
          value={personalData.jobbtitel}
          onChange={handleChange}
        />

        <TextFält
          label="Clearingnummer"
          name="clearingnummer"
          type="text"
          value={personalData.clearingnummer}
          onChange={handleChange}
        />

        <TextFält
          label="Bankkonto"
          name="bankkonto"
          type="text"
          value={personalData.bankkonto}
          onChange={handleChange}
        />

        <TextFält
          label="Mail"
          name="mail"
          type="email"
          value={personalData.mail}
          onChange={handleChange}
        />

        <TextFält
          label="Adress"
          name="adress"
          type="text"
          value={personalData.adress}
          onChange={handleChange}
        />

        <TextFält
          label="Postnummer"
          name="postnummer"
          type="text"
          value={personalData.postnummer}
          onChange={handleChange}
        />

        <TextFält
          label="Ort"
          name="ort"
          type="text"
          value={personalData.ort}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl text-white">Kompensation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Startdatum</label>
            <DatePicker
              selected={startdatum}
              onChange={(date: Date | null) => date && setStartdatum(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Förnya kontrakt</label>
            <DatePicker
              selected={förnyaKontrakt}
              onChange={(date: Date | null) => date && setFörnyaKontrakt(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Anställningstyp</label>
            <Dropdown
              value={anställningstyp}
              options={[
                { label: "Månadslön", value: "månadslön" },
                { label: "Timlön", value: "timlön" },
              ]}
              onChange={setAnställningstyp}
              placeholder="Välj"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Löneperiod</label>
            <Dropdown
              value={löneperiod}
              options={[
                { label: "Förskott", value: "förskott" },
                { label: "Efterskott", value: "efterskott" },
              ]}
              onChange={setLöneperiod}
              placeholder="Välj"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Ersättning per</label>
            <Dropdown
              value={ersättningPer}
              options={[
                { label: "Månad", value: "månad" },
                { label: "År", value: "år" },
                { label: "Timma", value: "timma" },
              ]}
              onChange={setErsättningPer}
              placeholder="Välj"
            />
          </div>

          <TextFält
            label="Kompensation"
            name="kompensation"
            type="text"
            value={kompensation}
            onChange={(e: any) => setKompensation(e.target.value)}
            placeholder="Ange kronor"
          />

          <TextFält
            label="Arbetsvecka, timmar"
            name="arbetsvecka"
            type="text"
            value={arbetsvecka}
            onChange={(e: any) => setArbetsvecka(e.target.value)}
            placeholder="40"
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">Arbetsbelastning</label>
            <Dropdown
              value={arbetsbelastning}
              options={[
                { label: "Heltid", value: "heltid" },
                { label: "Deltid", value: "deltid" },
              ]}
              onChange={setArbetsbelastning}
              placeholder="Välj"
            />
          </div>

          {/* Visa deltidsfält endast om Deltid är valt */}
          {arbetsbelastning === "deltid" && (
            <TextFält
              label="Deltid, procent"
              name="deltidProcent"
              type="text"
              value={deltidProcent}
              onChange={(e: any) => SetDeltidProcent(e.target.value)}
              placeholder="10"
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl text-white">Tjänsteställe</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextFält
            label="Adress"
            name="tjänsteställeAdress"
            type="text"
            value={tjänsteställeAdress}
            onChange={(e: any) => setTjänsteställeAdress(e.target.value)}
          />

          <TextFält
            label="Ort"
            name="tjänsteställeOrt"
            type="text"
            value={tjänsteställeOrt}
            onChange={(e: any) => setTjänsteställeOrt(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl text-white">Skatt</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Skattetabell</label>
            <Dropdown
              value={skattetabell}
              options={Array.from({ length: 14 }, (_, i) => ({
                label: String(29 + i),
                value: String(29 + i),
              }))}
              onChange={setSkattetabell}
              placeholder="Välj"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Skattekolumn</label>
            <Dropdown
              value={skattekolumn}
              options={Array.from({ length: 6 }, (_, i) => ({
                label: String(i + 1),
                value: String(i + 1),
              }))}
              onChange={setSkattekolumn}
              placeholder="Välj"
            />
          </div>

          <div>
            <label className="flex items-center text-white font-semibold">
              <input
                type="checkbox"
                checked={växaStöd}
                onChange={(e) => setVäxaStöd(e.target.checked)}
                className="mr-2 w-4 h-4"
              />
              Berättigad till VÄXA-stöd
            </label>
          </div>
        </div>
      </div>

      {/* Knappar */}
      <div className="flex gap-4 pt-4">
        <Knapp text={redigerarId ? "Uppdatera" : "Spara"} onClick={handleSpara} />
      </div>
    </div>
  );
}
