"use client";

interface FieldProps {
  label: string;
  type?: "text" | "number" | "date" | "textarea";
  value: string | number;
  onChange: (value: string) => void;
}

export default function Falt({ label, type = "text", value, onChange }: FieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value); // vi skickar alltid string, aldrig number
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-white font-medium">{label}</label>
      {type === "textarea" ? (
        <textarea
          className="w-full p-3 rounded-md bg-slate-900 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          rows={4}
          value={value}
          onChange={handleChange}
        />
      ) : (
        <input
          type={type}
          className="w-full p-3 rounded-md bg-slate-900 text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          value={value}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
