import { useState } from "react";

interface ContentHeaderProps {
  handleAddContent: (type: string, value: string) => void;
}

function ContentHeader({ handleAddContent }: ContentHeaderProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex items-center">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Rubrikens text"
        className="flex-grow p-2 mr-2 border border-gray-300 rounded"
      />
      <button
        className="px-4 py-2 text-white transition-colors duration-300 rounded bg-slate-700 hover:bg-slate-500"
        onClick={() => handleAddContent("header", inputValue)}
      >
        Lägg till rubrik
      </button>
    </div>
  );
}

export default ContentHeader;
