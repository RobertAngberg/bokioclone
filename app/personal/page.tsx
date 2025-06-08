"use client";

import MainLayout from "../_components/MainLayout";
import AnimeradFlik from "../_components/AnimeradFlik";
import Anställda from "./Anställda";
import Personalinformation from "./Personalinformation";
import Kontrakt from "./Kontrakt";
import Lönespecar from "./Lönespecar";
import Semester from "./Semester";

export default function PersonalPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Personal</h1>

        <AnimeradFlik title="Anställda" icon="👥">
          <Anställda />
        </AnimeradFlik>

        <AnimeradFlik title="Personalinformation" icon="📋">
          <Personalinformation />
        </AnimeradFlik>

        <AnimeradFlik title="Kontrakt" icon="📄">
          <Kontrakt />
        </AnimeradFlik>

        <AnimeradFlik title="Lönespecar" icon="💰">
          <Lönespecar />
        </AnimeradFlik>

        <AnimeradFlik title="Semester" icon="🏖️">
          <Semester />
        </AnimeradFlik>
      </div>
    </MainLayout>
  );
}
