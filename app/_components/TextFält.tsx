type TextFältProps = {
  label: string;
  name: string;
  type?: string; // "text", "number", "date", "textarea", etc.
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
};

export default function TextFält({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = true,
}: TextFältProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-white mb-2">
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white mb-4 h-24 resize-y"
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white mb-4"
        />
      )}
    </div>
  );
}
