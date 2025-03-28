import { useFetchPost } from "../hooks/useFetchPost";

interface Step3Props {
  kontonummer: string;
  kontobeskrivning: string;
  kontotyp: "Intäkt" | "Kostnad";
  fil?: File;
  belopp: number;
  transaktionsdatum: string;
  kommentar: string;
  setCurrentStep: (step: number) => void;
}

function Step3({
  kontonummer,
  kontobeskrivning,
  kontotyp,
  fil,
  belopp,
  transaktionsdatum,
  kommentar,
  setCurrentStep,
}: Step3Props) {
  const moms = parseFloat(((belopp ?? 0) * 0.2).toFixed(2));
  const beloppUtanMoms = parseFloat(((belopp ?? 0) * 0.8).toFixed(2));

  // Fattar fortfarande inte helt
  const postFormData = useFetchPost();

  const handleSubmit = async () => {
    const formData = new FormData();

    const formFields = {
      fil: fil || "",
      transaktionsdatum,
      kommentar,
      kontonummer,
      kontobeskrivning,
      kontotyp,
      belopp,
      moms,
      beloppUtanMoms,
    };

    // Loopar igenom alla värden i formFields och lägger till dem i formData
    Object.entries(formFields).forEach(([key, value]) => {
      if (value instanceof File) {
        // Om det är en fil, lägg till filen i formData, tredje param är filens namn, sist append
        formData.append(key, value, value.name);
      } else {
        // Om ej fil, konverterar värdet till en sträng och sen append
        formData.append(key, value !== undefined ? String(value) : "");
      }
    });

    await postFormData("api/bokfor/", formData);

    setCurrentStep(4);
  };

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold bokföring mb-4">Steg 3: Kontrollera och slutför</h1>
        <p className="w-full font-bold">{kontobeskrivning}</p>
        <p className="w-full mb-6">
          {transaktionsdatum ? new Date(transaktionsdatum).toLocaleDateString("sv-SE") : ""}
        </p>
        <table className="w-full mb-8 text-left border border-gray-300">
          <thead>
            <tr>
              <th className="p-4 border-b">Konto</th>
              <th className="p-4 border-b">Debet</th>
              <th className="p-4 border-b">Kredit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4">Företagskonto</td>
              <td className="p-4">{kontotyp === "Intäkt" ? belopp : 0}</td>
              <td className="p-4">{kontotyp === "Kostnad" ? belopp : 0}</td>
            </tr>
            <tr>
              <td className="p-4">{kontotyp === "Kostnad" ? "Ingående moms" : "Utgående moms"}</td>
              <td className="p-4">{kontotyp === "Kostnad" ? moms : 0}</td>
              <td className="p-4">{kontotyp === "Intäkt" ? moms : 0}</td>
            </tr>
            <tr>
              <td className="p-4">{kontonummer}</td>
              <td className="p-4">{kontotyp === "Kostnad" ? beloppUtanMoms : 0}</td>
              <td className="p-4">{kontotyp === "Intäkt" ? beloppUtanMoms : 0}</td>
            </tr>
          </tbody>
        </table>

        <button
          type="submit"
          className="flex items-center justify-center w-full px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
          onClick={handleSubmit}
        >
          Bokför
        </button>
      </div>
    </main>
  );
}

export { Step3 };
