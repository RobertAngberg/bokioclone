interface FöretagsinfoProps {
  anställd: any;
}

export default function Företagsinfo({ anställd }: FöretagsinfoProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white mb-4">
          {anställd.efternamn?.toUpperCase()}, {anställd.förnamn?.toUpperCase()}
        </h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>
            {anställd.adress} {anställd.postnummer} {anställd.ort}
          </div>
          <div>Organisationsnummer: {anställd.personnummer}</div>
          <div>{anställd.mail}</div>
        </div>
      </div>
    </div>
  );
}
