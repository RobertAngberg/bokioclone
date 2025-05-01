export default function Totalrad({
  label,
  values,
  isCost,
}: {
  label: string;
  values: Record<string, number>;
  isCost?: boolean;
}) {
  const format = (val: number) =>
    (isCost ? "-" : "") +
    Math.abs(val).toLocaleString("sv-SE", { minimumFractionDigits: 2 }) +
    " kr";

  return (
    <div className="w-full border-t border-slate-600 mb-2 pt-0">
      <div className="flex justify-between items-center text-white font-bold text-[16px] px-6 py-3 bg-slate-800">
        <div>{label}</div>
        <div className="flex gap-6">
          {Object.keys(values)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((year) => (
              <div key={year} className="text-right min-w-[80px]" title={year}>
                {format(values[year] || 0)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
