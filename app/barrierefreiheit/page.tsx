export default function BarrierefreiheitPage() {
  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            Zugänglichkeit
          </p>
          <h1 className="mt-2 text-4xl font-bold">Barrierefreiheit</h1>
          <p className="mt-4 rounded-lg bg-amber-50 p-4 font-semibold text-amber-900">
            Platzhalter: Diese Erklärung muss später an den tatsächlichen Stand
            der App angepasst werden.
          </p>

          <div className="mt-8 space-y-8 leading-7 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Unser Anspruch
              </h2>
              <p className="mt-3">
                KurzWarten soll für möglichst viele Menschen verständlich und
                bedienbar sein, unabhängig von Alter, Erfahrung oder Endgerät.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Aktueller Stand
              </h2>
              <p className="mt-3">
                Die App verwendet große Eingabefelder, klare Beschriftungen,
                sichtbare Fokuszustände und kontrastreiche Schaltflächen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Rückmeldung
              </h2>
              <p className="mt-3">
                Wenn du Barrieren bemerkst, schreibe bitte an:
                [E-Mail-Adresse ergänzen].
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
