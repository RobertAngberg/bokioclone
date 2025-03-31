import React from "react";

interface InputComponentProps {
  labelText: string;
  textFields: Record<string, string>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function TextField({ labelText, textFields, handleInputChange }: InputComponentProps) {
  return (
    <div key={labelText} className="w-full">
      <label htmlFor={labelText}>{labelText}:</label>
      <input
        className="w-full p-2 mt-2 mb-2 text-black border-2 border-gray-600 border-solid rounded-md"
        type="text"
        id={labelText}
        name={labelText}
        value={textFields[labelText]}
        placeholder={labelText}
        onChange={handleInputChange}
      />
    </div>
  );
}

export { TextField };
