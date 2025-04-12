"use client";

interface FieldProps {
  label: string;
  type?: "text" | "number" | "date" | "textarea";
  value: string | number;
  onChange: (value: string) => void;
}

export default function Falt({ label, type = "text", value, onChange }: FieldProps) {
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      {type === "textarea" ? (
        <textarea
          className="w-full p-2 rounded text-black"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="w-full p-2 rounded text-black"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
