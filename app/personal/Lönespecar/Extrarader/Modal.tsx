import { FormEvent, ChangeEvent } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  fields: {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  }[];
  onSubmit: (e: FormEvent) => void;
}

export default function Modal({ open, onClose, title, fields, onSubmit }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-400 mb-1">{field.label}</label>
              <input
                type={field.name === "kolumn3" ? "number" : "text"}
                step={field.name === "kolumn3" ? "0.01" : undefined}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required={field.name !== "kolumn4"} // Kommentar är inte required
              />
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500"
            >
              Lägg till
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
