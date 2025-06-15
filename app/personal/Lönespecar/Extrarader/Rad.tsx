export default function Rad({
  id,
  label,
  checked,
  toggle,
}: {
  id: string;
  label: string;
  checked?: boolean;
  toggle: () => void;
}) {
  return (
    <div
      className="flex items-center px-2 py-1 hover:bg-slate-700 rounded cursor-pointer min-h-10 text-sm"
      onClick={toggle}
      style={{ minHeight: "2.2rem" }}
    >
      <input
        type="checkbox"
        checked={checked ?? false}
        readOnly
        className="mr-2 w-5 h-5 accent-blue-500 flex-shrink-0"
        style={{ minWidth: "1.25rem", minHeight: "1.25rem" }}
      />
      <span>{label}</span>
    </div>
  );
}
