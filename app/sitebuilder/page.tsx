"use client";

import { useState } from "react";
import { Logo } from "./Logo";
import { Navbar } from "./Navbar";
import Section from "./Section";
import HeroImage from "./HeroImage";
import Footer from "./Footer";

function Sitebuilder() {
  const [sections, setSections] = useState<number[]>([1]);
  const [nextSectionId, setNextSectionId] = useState(2);

  return (
    <main className="flex items-start justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col w-full min-h-screen bg-white shadow-lg lg:w-2/3 shadow-slate-400">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <Navbar />
          </div>

          <div className="mt-4">
            <HeroImage />
          </div>
        </div>

        <div className="flex-grow px-6 py-0 mb-60">
          {sections.map((sectionId: number) => (
            <Section
              key={sectionId}
              sections={sections}
              setSections={(prevSections) => {
                setNextSectionId(nextSectionId + 1);
                return [...(prevSections as number[])];
              }}
              sectionId={sectionId}
              nextSectionId={nextSectionId}
            />
          ))}
        </div>

        <Footer />
      </div>

      {/* Syns bara på mindre skärmar */}
      <div className="fixed inset-0 flex items-center justify-center text-white bg-slate-950 lg:hidden">
        <p className="p-4 text-xl text-center md:p-8">
          Beklagar, den här funktionen är endast tillgänglig på större skärmar.
        </p>
      </div>
    </main>
  );
}

export default Sitebuilder;
