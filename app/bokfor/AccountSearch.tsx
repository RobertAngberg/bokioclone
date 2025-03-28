"use client";

import { useEffect, useState, useCallback } from "react";
import { SearchResults } from "./SearchResults";
import { searchAccount } from "./actions";

interface FetchDataItem {
  kontonummer: string;
  kontobeskrivning: string;
  sökord: string;
}

interface AccountSearchProps {
  setCurrentStep: (step: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  setKontonummer: (kontonummer: string) => void;
  setKontobeskrivning: (kontobeskrivning: string) => void;
}

function AccountSearch({
  setCurrentStep,
  searchText,
  setSearchText,
  setKontonummer,
  setKontobeskrivning,
}: AccountSearchProps) {
  const [searchResult, setSearchResult] = useState<FetchDataItem | null>(null);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!searchText.trim()) return;
      try {
        const result = await searchAccount(searchText);
        console.log("🔥 RESULT:", result);
        setSearchResult(
          result?.kontonummer && result.kontobeskrivning && result.sökord ? result : null
        );
      } catch (error) {
        console.error("❌ searchAccount failed:", error);
        setSearchResult(null);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchText]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value.trim().toLowerCase());
    },
    [setSearchText]
  );

  const handleResultClick = useCallback(
    (item: FetchDataItem) => {
      setKontonummer(item.kontonummer);
      setKontobeskrivning(item.kontobeskrivning);
      setCurrentStep(2);
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
    </div>
  );
}

export { AccountSearch };
