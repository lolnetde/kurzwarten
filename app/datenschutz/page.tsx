export default function DatenschutzPage() {
  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            Datenschutz
          </p>
          <h1 className="mt-2 text-4xl font-bold">Datenschutzerklärung</h1>
          <p className="mt-4 rounded-lg bg-amber-50 p-4 font-semibold text-amber-900">
            Platzhalter: Bitte vor Veröffentlichung prüfen und an deine echte
            Datenverarbeitung anpassen.
          </p>

          <div className="mt-8 space-y-8 leading-7 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Verantwortlicher
              </h2>
              <p className="mt-3">
                Verantwortlich für die Datenverarbeitung ist:
                <br />
                [Name / Unternehmen]
                <br />
                [Adresse]
                <br />
                E-Mail: [E-Mail-Adresse]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Welche Daten verarbeitet KurzWarten?
              </h2>
              <p className="mt-3">
                KurzWarten verarbeitet im aktuellen Stand insbesondere den
                Namen, den Nutzer beim Ziehen eines Tickets eingeben, sowie
                Ticketnummer, Status, Unternehmenszuordnung und Zeitpunkte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Zweck der Verarbeitung
              </h2>
              <p className="mt-3">
                Die Daten werden verwendet, um digitale Warteschlangen zu
                erstellen, Wartepositionen anzuzeigen und Tickets im
                Adminbereich aufzurufen oder abzuschließen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Rechtsgrundlage
              </h2>
              <p className="mt-3">
                Die genaue Rechtsgrundlage muss abhängig vom späteren Betrieb
                geprüft werden. In Betracht kommen insbesondere Einwilligung,
                Vertragserfüllung oder berechtigtes Interesse nach DSGVO.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Hosting und Datenbank
              </h2>
              <p className="mt-3">
                Die App wird technisch über Vercel betrieben. Für die Datenbank
                wird Supabase verwendet. Bitte ergänze hier die konkreten
                Anbieterinformationen, Regionen, Auftragsverarbeitungsverträge
                und Links zu den Datenschutzhinweisen der Anbieter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Lokale Speicherung im Browser
              </h2>
              <p className="mt-3">
                Die App speichert die Ticketnummer lokal im Browser, damit das
                Ticket nach einem Neuladen der Seite wieder angezeigt werden
                kann. Diese Speicherung erfolgt auf dem Gerät des Nutzers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Rechte der betroffenen Personen
              </h2>
              <p className="mt-3">
                Betroffene Personen haben je nach Situation Rechte auf Auskunft,
                Berichtigung, Löschung, Einschränkung der Verarbeitung,
                Datenübertragbarkeit und Widerspruch. Außerdem kann ein
                Beschwerderecht bei einer Datenschutzaufsichtsbehörde bestehen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Hinweis
              </h2>
              <p className="mt-3">
                Diese Datenschutzerklärung ist ein Platzhalter und muss vor
                einem echten Betrieb fachlich geprüft werden.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
