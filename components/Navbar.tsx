import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/home" className="text-2xl font-bold tracking-tight">
          KurzWarten
        </Link>

        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <Link
            href="/home"
            className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>

          <Link
            href="/warten"
            className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            Für Patienten
          </Link>

          <Link
            href="/admin"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Für Praxen
          </Link>
        </div>
      </div>
    </nav>
  );
}
