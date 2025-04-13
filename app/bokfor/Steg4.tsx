import Link from "next/link";
import React from "react";

export default function Steg4() {
  return (
    <main className="flex flex-col items-center min-h-screen pt-24 text-white bg-slate-950 px-4 text-center">
      <h1 className="mb-14 text-4xl font-bold">Bokföring genomförd!</h1>
      <Link
        className="px-6 py-4 font-bold text-white rounded-lg bg-cyan-600 hover:bg-cyan-700 transition"
        href="/bokfor"
        onClick={() => window.location.reload()}
      >
        Bokför något nytt
      </Link>
    </main>
  );
}
