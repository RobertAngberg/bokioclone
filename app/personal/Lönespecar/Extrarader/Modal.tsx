import TextFält from "../../../_components/TextFält";
import Knapp from "../../../_components/Knapp";

type ModalField = {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  fields?: ModalField[];
  title?: string;
  children?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
};

const defaultFields: ModalField[] = [
  {
    label: "Antal",
    name: "antal",
    type: "number",
    value: "",
    onChange: () => {},
    placeholder: "Antal",
  },
  {
    label: "à SEK",
    name: "aSEK",
    type: "number",
    value: "",
    onChange: () => {},
    placeholder: "à SEK",
  },
  {
    label: "Kommentar",
    name: "kommentar",
    type: "text",
    value: "",
    onChange: () => {},
    placeholder: "Kommentar",
  },
];

export default function Modal({
  open,
  onClose,
  fields = defaultFields,
  title = "Redigera",
  children,
  onSubmit,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 min-w-[340px] max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} aria-label="Stäng" type="button">
            <span role="img" aria-label="Stäng">
              ❌
            </span>
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fields.map((field) => (
              <TextFält
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={field.value}
                onChange={field.onChange}
                placeholder={field.placeholder}
                required={field.required}
              />
            ))}
          </div>
          {children && <div className="mt-4">{children}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <Knapp text="❌ Avbryt" onClick={onClose} type="button" />
            <Knapp text="💾 Spara" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
}
