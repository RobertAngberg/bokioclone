type Props = {
  label: string;
  values: Record<string, number | string>;
  isCost?: boolean;
};

export default function Totalrad({ label, values, isCost = false }: Props) {
  return (
    <div className="flex justify-between items-center font-semibold border-t border-slate-500 py-3 mt-2">
      <span>{label}</span>
      <div className="flex gap-8">
        {Object.entries(values).map(([year, value]) => {
          const num = typeof value === "number" ? value : parseFloat(value as string) || 0;
          const displayValue = isCost ? -Math.abs(num) : Math.abs(num);
          return (
            <span key={year} className="min-w-[100px] text-right">
              {displayValue.toLocaleString("sv-SE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kr
            </span>
          );
        })}
      </div>
    </div>
  );
}
