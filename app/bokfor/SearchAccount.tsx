import React, { useState, useEffect, useCallback } from "react";
import { SearchResults } from "./SearchResults";
import { searchAccount } from "./actions";

interface FetchDataItem {
  kontonummer: string;
  kontobeskrivning: string;
  sökord: string;
}

interface SearchAccountProps {
  setCurrentStep: (step: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  setKontonummer: (kontonummer: string) => void;
  setKontobeskrivning: (kontobeskrivning: string) => void;
}

function SearchAccount({
  setCurrentStep,
  searchText,
  setSearchText,
  setKontonummer,
  setKontobeskrivning,
}: SearchAccountProps) {
  const [searchResult, setSearchResult] = useState<FetchDataItem | null>(null);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!searchText.trim()) return; // Gör inget om sökfältet är tomt
      try {
        const result = await searchAccount(searchText); // Anropar backend för att få resultatet
        setSearchResult(result); // Uppdaterar state med resultatet från backend
      } catch (error) {
        console.error("SearchAccount failed:", error);
        setSearchResult(null); // Om det händer något fel, sätt resultatet till null
      }
    }, 500); // Timeout för att minska antal anrop

    return () => clearTimeout(delay);
  }, [searchText]); // Kör om varje gång searchText ändras

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value.trim().toLowerCase()); // Uppdaterar söktexten
    },
    [setSearchText]
  );

  const handleResultClick = useCallback(
    (item: FetchDataItem) => {
      setKontonummer(item.kontonummer.trim()); // Sätter kontonummer
      setKontobeskrivning(item.kontobeskrivning.trim()); // Sätter kontobeskrivning
      setCurrentStep(2); // Går vidare till nästa steg
    },
    [setCurrentStep, setKontonummer, setKontobeskrivning]
  );

  return (
    <div className="w-full">
      <h1 className="mb-4 text-4xl font-bold">Steg 1: Sök förval</h1>
      <p>Skriv in vad du vill bokföra.</p>
      <p>Systemet hittar rätt förval att använda.</p>

      <input
        className="w-full p-3 mt-4 text-black border-2 rounded-lg border-slate-950"
        type="text"
        id="search-account-number"
        name="searchInput"
        autoComplete="off"
        value={searchText}
        onChange={handleSearchChange}
      />

      {searchResult && searchText && (
        <SearchResults data={searchResult} onClick={handleResultClick} />
      )}

      {!searchResult && searchText && (
        <p className="text-red-500">Inget resultat hittades för: &quot;{searchText}&quot;</p>
      )}
    </div>
  );
}

export { SearchAccount };
