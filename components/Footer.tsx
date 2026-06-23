import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} KurzWarten</p>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
          <Link href="/impressum" className="hover:text-slate-950">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-slate-950">
            Datenschutz
          </Link>
          <Link href="/nutzungsbedingungen" className="hover:text-slate-950">
            Nutzungsbedingungen
          </Link>
          <Link href="/barrierefreiheit" className="hover:text-slate-950">
            Barrierefreiheit
          </Link>
        </nav>
      </div>
    </footer>
  );
}
