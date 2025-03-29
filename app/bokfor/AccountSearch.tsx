"use client";

import { useEffect, useState } from "react";
import { SearchResults } from "./SearchResults";
import { searchAccount } from "./actions";

interface FetchDataItem {
  kontonummer: string;
  kontobeskrivning: string;
  sökord: string;
}

function AccountSearch({
  setCurrentStep,
  searchText,
  setSearchText,
  setKontonummer,
  setKontobeskrivning,
}: {
  setCurrentStep: (step: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  setKontonummer: (kontonummer: string) => void;
  setKontobeskrivning: (kontobeskrivning: string) => void;
}) {
  const [searchResult, setSearchResult] = useState<FetchDataItem | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchText.trim()) return;
      const result = await searchAccount(searchText);
      console.log("🔥 RESULT:", result); // check encoding here
      if (result?.kontonummer && result.kontobeskrivning && result.sökord) {
        setSearchResult(result);
      } else {
        setSearchResult(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const handleSearchAccNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    setSearchText(value);
  };

  const handleResultClick = (item: FetchDataItem): void => {
    setKontonummer(item.kontonummer);
    setKontobeskrivning(item.kontobeskrivning);
    setCurrentStep(2);
  };

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
        onChange={handleSearchAccNum}
      />

      {searchResult && searchText && (
        <SearchResults data={searchResult} onClick={handleResultClick} />
      )}
    </div>
  );
}

export { AccountSearch };
