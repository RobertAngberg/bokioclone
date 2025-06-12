interface LönespecHeaderProps {
  personnummer: string;
  bankkonto: string;
  löneperiod: string;
}

export default function LönespecHeader({
  personnummer,
  bankkonto,
  löneperiod,
}: LönespecHeaderProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Lön för {new Date().toLocaleDateString("sv-SE", { month: "long", year: "numeric" })}
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
        <div>
          <strong>Personnummer</strong>
          <br />
          {personnummer}
        </div>
        <div>
          <strong>Bankkonto</strong>
          <br />
          {bankkonto}
        </div>
      </div>
      <div className="mb-4">
        <strong className="text-white">Löneperiod</strong>
        <br />
        <span className="text-gray-300">{löneperiod}</span>
      </div>
    </div>
  );
}
