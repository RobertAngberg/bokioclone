interface SammanfattningProps {
  bruttolön: number;
  skatt: number;
  nettolön: number;
  socialSkatt: number;
  totalLönekostnad: number;
  utbetalning: string;
  anställd: any;
}

export default function Sammanfattning({
  bruttolön,
  skatt,
  nettolön,
  socialSkatt,
  totalLönekostnad,
  utbetalning,
  anställd,
}: SammanfattningProps) {
  return (
    <>
      {/* Sammanfattning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          {/* Totalt sektion */}
          <div className="bg-slate-700 p-4 rounded">
            <h4 className="font-semibold text-white mb-2">Totalt</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Lönekostnad</span>
                <span className="text-white font-semibold">
                  {totalLönekostnad.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                </span>
              </div>
            </div>
          </div>

          {/* Totalt uppdelning */}
          <div className="bg-slate-700 p-4 rounded">
            <h4 className="font-semibold text-white mb-2">Totalt</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Bruttolön</span>
                <span className="text-white">
                  {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">varav</span>
                <span className="text-gray-300"></span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">sociala avgifter</span>
                <span className="text-orange-400">
                  {socialSkatt.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">varav</span>
                <span className="text-gray-300"></span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Skatt</span>
                <span className="text-red-400">
                  {skatt.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                </span>
              </div>
            </div>
          </div>

          {/* Utbetalning */}
          <div className="bg-slate-700 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Utbetalas: {utbetalning}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Nettolön</span>
              <span className="text-xl font-bold text-green-400">
                {nettolön.toLocaleString("sv-SE")} kr
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Semesterdagar */}
          <div className="bg-slate-700 p-4 rounded">
            <h4 className="font-semibold text-white mb-2">Semesterdagar</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Betalda</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Sparade</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Förskott</span>
                <span className="text-white">0</span>
              </div>
            </div>
          </div>

          {/* Skatt beräknad på */}
          <div className="bg-slate-700 p-4 rounded">
            <h4 className="font-semibold text-white mb-2">Skatt beräknad på</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Skattetabell</span>
                <span className="text-white">{anställd.skattetabell}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Skattekolumn</span>
                <span className="text-white">{anställd.skattekolumn}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totalt detta år */}
      <div className="bg-slate-700 p-4 rounded mb-6">
        <h4 className="font-semibold text-white mb-2">Totalt detta år</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Brutto</span>
            <span className="text-white">
              {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Förmåner</span>
            <span className="text-white">0,00 kr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Skatt</span>
            <span className="text-white">
              {skatt.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
