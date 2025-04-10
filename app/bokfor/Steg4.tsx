import Link from "next/link";
import React from "react";

export default function Steg4() {
  return (
    <main className="text-white">
      <h1 className="mb-14 text-4xl font-bold">Bokföring genomförd!</h1>
      <Link
        className="px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
        href="/bokfor"
        onClick={() => window.location.reload()}
      >
        Bokför något nytt
      </Link>
    </main>
  );
}
