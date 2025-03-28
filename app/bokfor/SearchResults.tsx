interface SearchResultsProps {
  data: {
    kontonummer: string;
    kontotyp: string;
    kontobeskrivning: string;
    sökord: string;
  };
  onClick: (data: { kontonummer: string; kontotyp: string; kontobeskrivning: string }) => void;
}

function SearchResults({ data, onClick }: SearchResultsProps) {
  return (
    <div id="searchResults">
      <div
        className="w-full px-4 py-3 mt-2 mb-4 text-xl font-bold text-black bg-white rounded hover:bg-gray-300 hover:cursor-pointer"
        onClick={() => onClick(data)}
      >
        &#10003; &nbsp; {data.kontonummer} - {data.kontobeskrivning}
        <p className="p-2 text-base">Sökord:</p>
        <div className="text-base font-normal">{data.sökord}</div>
      </div>
    </div>
  );
}

export { SearchResults };
