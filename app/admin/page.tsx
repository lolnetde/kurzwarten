import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function AdminOverviewPage() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl flex-col justify-center px-5 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <BrandLogo className="w-[190px]" />
          <h1 className="mt-2 text-4xl font-bold leading-tight">
            Adminbereich öffnen
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Melde dich über die Startseite mit Unternehmensnamen und Passwort
            an.
          </p>
          <Link
            href="/home"
            className="mt-7 flex h-12 items-center justify-center rounded-lg bg-blue-700 px-6 font-semibold text-white hover:bg-blue-800"
          >
            Zur Anmeldung
          </Link>
        </div>
      </section>
    </main>
  );
}
