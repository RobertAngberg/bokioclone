// Tabell.tsx

type TabellProps = {
  kolumntitlar: string[];
  rader: (string | number)[][];
  summering?: (string | number)[];
};

export default function Tabell({ kolumntitlar, rader, summering }: TabellProps) {
  return (
    <div className="overflow-x-auto text-sm">
      <div className="grid grid-cols-[1fr_repeat(auto-fit,minmax(4rem,1fr))] gap-x-4 font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-2">
        {kolumntitlar.map((titel, i) => (
          <div key={i} className={i === 0 ? "" : "text-right"}>
            {titel}
          </div>
        ))}
      </div>

      {rader.map((rad, i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_repeat(auto-fit,minmax(4rem,1fr))] gap-x-4 py-1 border-b border-slate-800"
        >
          {rad.map((cell, j) => (
            <div key={j} className={j === 0 ? "text-slate-200" : "text-right tabular-nums"}>
              {typeof cell === "number" ? cell.toLocaleString("sv-SE") : cell}
            </div>
          ))}
        </div>
      ))}

      {summering && (
        <div className="grid grid-cols-[1fr_repeat(auto-fit,minmax(4rem,1fr))] gap-x-4 mt-2 pt-2 border-t border-slate-700 font-semibold text-slate-100">
          {summering.map((cell, i) => (
            <div key={i} className={i === 0 ? "" : "text-right tabular-nums"}>
              {typeof cell === "number" ? cell.toLocaleString("sv-SE") : cell}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
