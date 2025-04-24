"use client";

import AdminFlik from "./AdminFlik";
import VisaAllt from "./VisaAllt";
import VisaTransaktioner from "./VisaTransaktioner";
import ForvalDatabas from "./ForvalDatabas";
import VisaKonton from "./VisaKonton";
import SQLEditor from "./SQLEditor";
import Foretagsprofil from "./Foretagsprofil";
import MainLayout from "../_components/MainLayout";

export default function Admin() {
  return (
    <MainLayout>
      <div
        className="
          space-y-6
          [&_details]:border [&_details]:border-slate-700 [&_details]:rounded-lg
          [&_details>summary]:bg-slate-900 [&_details>summary:hover]:bg-slate-800
          [&_details>summary]:rounded-lg [&_details>summary]:cursor-pointer
          [&_details>summary]:px-4 [&_details>summary]:py-3
          [&_details>summary]:flex [&_details>summary]:items-center [&_details>summary]:justify-between
          [&_details>summary]:text-lg [&_details>summary]:font-semibold
          [&_details>summary>span]:ml-auto
        "
      >
        <h1 className="text-3xl text-center text-white mb-6">Adminpanel</h1>

        <AdminFlik title="Företagsprofil" icon="🧑‍💼">
          <Foretagsprofil />
        </AdminFlik>

        <AdminFlik title="Visa alla tabeller" icon="📑">
          <VisaAllt />
        </AdminFlik>

        <AdminFlik title="SQL‑verktyg" icon="🛠">
          <SQLEditor />
        </AdminFlik>

        <AdminFlik title="Transaktioner" icon="💾">
          <VisaTransaktioner />
        </AdminFlik>

        <AdminFlik title="Konton" icon="📚">
          <VisaKonton />
        </AdminFlik>

        <AdminFlik title="Förval" icon="📋">
          <ForvalDatabas />
        </AdminFlik>
      </div>
    </MainLayout>
  );
}
