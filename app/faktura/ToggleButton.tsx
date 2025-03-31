import React from "react";

interface ToggleButtonProps {
  toggleGroup: string;
  buttonText: string;
  fieldGroupVisible: boolean;
  onToggle: (group: string) => void;
}

function ToggleButton({ toggleGroup, buttonText, fieldGroupVisible, onToggle }: ToggleButtonProps) {
  return (
    <button
      onClick={() => onToggle(toggleGroup)}
      className="px-4 py-2 mb-2 font-bold text-white bg-blue-500 rounded cursor-pointer hover:bg-blue-700"
    >
      {buttonText}: {fieldGroupVisible ? "↓" : "→"}
    </button>
  );
}

export { ToggleButton };
