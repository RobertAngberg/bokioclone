//#region Huvud
"use client";

type DropdownProps = {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
};
//#endregion

export default function Dropdown({ value, options, onChange, placeholder }: DropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 text-white rounded cursor-pointer bg-cyan-700 hover:bg-cyan-800"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
