import React, { useState, useRef } from "react";

function Footer() {
  const [isEditing, setIsEditing] = useState(false);
  const [footerText, setFooterText] = useState("Sidfot, klicka för att ändra");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleTextClick = () => {
    setIsEditing(true);
    setInputValue(""); // Clear the input value when editing starts
    setTimeout(() => {
      inputRef.current?.focus(); // Focus the input after it appears
    }, 0);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSave = () => {
    if (inputValue.trim()) {
      setFooterText(inputValue); // Save the input value if not empty
    } else {
      setFooterText("Sidfot, klicka för att ändra"); // Default text if input is empty
    }
    setIsEditing(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  return (
    <footer className="py-4 text-center bg-gray-100">
      {isEditing ? (
        <div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="px-2 py-1 border rounded"
            placeholder="Skriv något..." // Placeholder to indicate it's ready for input
          />
          <button onClick={handleSave} className="ml-2 bg-blue-500 text-white px-4 py-1 rounded">
            Spara
          </button>
        </div>
      ) : (
        <p onClick={handleTextClick} className="cursor-pointer text-gray-700">
          {footerText}
        </p>
      )}
    </footer>
  );
}

export default Footer;
