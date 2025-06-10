interface AnställdInfoProps {
  anställd: any;
  personnummer: string;
  bankkonto: string;
}

export default function AnställdInfo({ anställd, personnummer, bankkonto }: AnställdInfoProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {anställd.förnamn} {anställd.efternamn}
          </h1>
          <div className="space-y-1 text-sm text-gray-300">
            <div>
              <strong>Adress:</strong> {anställd.adress} {anställd.postnummer} {anställd.ort}
            </div>
            <div>
              <strong>Mail:</strong> {anställd.mail}
            </div>
            <div>
              <strong>Personnummer:</strong> {personnummer}
            </div>
            <div>
              <strong>Bankkonto:</strong> {bankkonto}
            </div>
            <div>
              <strong>Skattetabell:</strong> {anställd.skattetabell}
            </div>
            <div>
              <strong>Skattekolumn:</strong> {anställd.skattekolumn}
            </div>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Redigera anställd
        </button>
      </div>
    </div>
  );
}
