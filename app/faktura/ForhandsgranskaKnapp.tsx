"use client";

export default function ForhandsgranskaKnapp({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={className}>
      🔍 Förhandsgranska
    </button>
  );
}
