"use client";

export default function ForhandsgranskaKnapp({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800 ${className}`}
    >
      🔍 Förhandsgranska
    </button>
  );
}
