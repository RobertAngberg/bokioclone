export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="flex flex-col items-center">
        {/* Dubbel spinner-effekt */}
        <div className="relative w-12 h-12">
          {/* Yttre vit spinner */}
          <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          {/* Inre cyan spinner med reverse */}
          <div className="absolute inset-0 border-4 border-cyan-500 border-r-transparent rounded-full animate-spin reverse-spin"></div>
        </div>

        {/* Laddningstext */}
        <p className="mt-4 text-lg text-gray-300">Laddar sida...</p>
      </div>
    </div>
  );
}
