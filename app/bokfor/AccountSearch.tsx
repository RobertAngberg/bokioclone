import React, { useState } from "react";
import { useFetchGet } from "../hooks/useFetchGet";
import { SearchResults } from "./SearchResults";

interface FetchDataItem {
  kontonummer: string;
  kontotyp: string;
  kontobeskrivning: string;
}

function AccountSearch({
  setCurrentStep,
  searchText,
  setSearchText,
  setKontonummer,
  setKontotyp,
  setKontobeskrivning,
}: {
  setCurrentStep: (step: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  setKontonummer: (kontonummer: string) => void;
  setKontotyp: (kontotyp: string) => void;
  setKontobeskrivning: (kontobeskrivning: string) => void;
}) {
  const [showSearchResults, setShowSearchResults] = useState(true);
  const { fetchData, error } = useFetchGet(`api/bokfor?q=${searchText}`);

  const handleSearchAccNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim().toLowerCase();
    setSearchText(inputValue);
  };

  const searchResultClick = (item: FetchDataItem): void => {
    setKontonummer(item.kontonummer);
    setKontotyp(item.kontotyp);
    setKontobeskrivning(item.kontobeskrivning);
    setCurrentStep(2);
    setShowSearchResults(false);
  };

  return (
    <div className="w-full">
      <h1 className="mb-4 text-4xl font-bold">Steg 1: Sök förval</h1>
      <div className="mb-2">
        <p>Skriv in vad du vill bokföra.</p>
        <p>Systemet hittar rätt förval att använda.</p>
      </div>
      <input
        className="w-full p-3 mt-4 text-black border-2 rounded-lg border-slate-950"
        type="text"
        id="search-account-number"
        name="searchInput"
        autoComplete="off"
        value={searchText}
        onChange={handleSearchAccNum}
      />

      {/* Div med sökresultat */}
      {showSearchResults && fetchData && searchText && (
        <SearchResults data={fetchData} onClick={searchResultClick} />
      )}
    </div>
  );
}

export { AccountSearch };
