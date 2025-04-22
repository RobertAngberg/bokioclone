"use client";

import Loading from "./Loading";

export default function SkalMedLoading() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <Loading isLoading={true} minHeight="20rem">
            <div className="text-center text-slate-300">🧱 Inget innehåll än</div>
          </Loading>
        </div>
      </div>
    </main>
  );
}
