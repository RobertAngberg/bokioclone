type TextFältProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function TextFält({ label, name, value, onChange }: TextFältProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
      />
    </div>
  );
}
