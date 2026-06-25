export default function NutzungsbedingungenPage() {
  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            Bedingungen
          </p>
          <h1 className="mt-2 text-4xl font-bold">Nutzungsbedingungen</h1>
          <p className="mt-4 rounded-lg bg-amber-50 p-4 font-semibold text-amber-900">
            Platzhalter: Diese Bedingungen sind noch nicht final und sollten vor
            einem kommerziellen Start geprüft werden.
          </p>

          <div className="mt-8 space-y-8 leading-7 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Zweck der Anwendung
              </h2>
              <p className="mt-3">
                KurzWarten dient der einfachen Verwaltung digitaler
                Warteschlangen für Dienstleister, Einrichtungen und andere
                Organisationen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Verantwortlichkeit der Unternehmen
              </h2>
              <p className="mt-3">
                Unternehmen sind dafür verantwortlich, ihre Warteschlangen
                korrekt zu verwalten, Zugangsdaten sicher aufzubewahren und nur
                notwendige personenbezogene Daten einzugeben.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Verfügbarkeit
              </h2>
              <p className="mt-3">
                KurzWarten befindet sich im Aufbau. Eine jederzeitige
                Verfügbarkeit kann im aktuellen Testbetrieb nicht garantiert
                werden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Kein Fach- oder Notfalldienst
              </h2>
              <p className="mt-3">
                KurzWarten ersetzt keine fachliche Beratung, keine
                Notfallversorgung und keine Entscheidung einer Einrichtung über
                Reihenfolgen vor Ort.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
