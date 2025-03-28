import { useState } from "react";

interface ContentTextProps {
  handleAddContent: (type: string, value: string) => void;
}

function ContentText({ handleAddContent }: ContentTextProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex items-center">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter your text"
        className="flex-grow p-2 mr-2 border border-gray-300 rounded"
      />
      <button
        className="px-4 py-2 text-white transition-colors duration-300 rounded bg-slate-700 hover:bg-slate-500"
        onClick={() => handleAddContent("text", inputValue)}
      >
        Lägg till text
      </button>
    </div>
  );
}

export default ContentText;
