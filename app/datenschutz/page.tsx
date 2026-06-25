export default function DatenschutzPage() {
  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Datenschutz</p>
          <h1 className="mt-2 text-4xl font-bold">Datenschutzerklärung</h1>
          <p className="mt-4 rounded-lg bg-amber-50 p-4 font-semibold text-amber-900">
            Platzhalter: Diese Datenschutzerklärung muss vor einem echten
            kommerziellen Betrieb rechtlich geprüft und mit den echten
            Betreiberangaben ergänzt werden.
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
                KurzWarten verarbeitet Daten, die für die digitale
                Warteschlange notwendig sind. Dazu gehören insbesondere
                Ticketnummer, Status, zugehöriges Unternehmen, zugeordneter
                Mitarbeiter oder Bereich, Zeitpunkte und gegebenenfalls ein Name
                der wartenden Person.
              </p>
              <p className="mt-3">
                Ein Name wird nur erhoben, wenn das zugehörige Unternehmen den
                Namen zu einem Ticket einträgt oder diese Funktion nutzt. Der
                Name dient ausschließlich dazu, ein Ticket vor Ort besser
                zuordnen zu können.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Zweck der Verarbeitung
              </h2>
              <p className="mt-3">
                Die Daten werden verwendet, um digitale Warteschlangen zu
                erstellen, Wartepositionen anzuzeigen, Wartezeiten zu schätzen
                und Tickets im Adminbereich aufzurufen, zu erledigen oder zu
                löschen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Speicherdauer und Löschung
              </h2>
              <p className="mt-3">
                Ticketdaten mit Namen werden nur kurzfristig gespeichert. Sie
                werden gelöscht, wenn das Ticket gelöscht wird. Spätestens nach
                Ablauf des jeweiligen Tages werden die einzelnen Tickets in eine
                Tagesstatistik übernommen und aus der aktiven Ticketliste
                entfernt. In der Statistik bleiben nur zusammengefasste Zahlen
                wie Anzahl der Tickets, aufgerufene Tickets, erledigte Tickets
                und gelöschte Tickets erhalten; Namen werden dort nicht
                gespeichert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Cookies und lokale Speicherung
              </h2>
              <p className="mt-3">
                KurzWarten setzt im aktuellen Stand keine eigenen Cookies für
                Login, Tracking oder Werbung ein. Die App nutzt jedoch lokale
                Speicherung im Browser (LocalStorage), damit bestimmte
                Funktionen komfortabler nutzbar sind.
              </p>
              <p className="mt-3">
                Auf der Kundenseite kann die Ticketnummer lokal im Browser
                gespeichert werden, damit das Ticket nach einem Neuladen der
                Seite wieder angezeigt wird. Diese lokale Speicherung wird
                entfernt, wenn das Ticket abgeschlossen, gelöscht oder durch die
                Funktion &quot;Andere Ticketnummer eingeben&quot; verlassen wird.
              </p>
              <p className="mt-3">
                Im Adminbereich kann das Admin-Passwort lokal im Browser
                gespeichert werden, damit die Anmeldung beim Neuladen oder
                erneuten Öffnen nicht sofort erneut eingegeben werden muss. Diese
                lokale Speicherung wird beim Abmelden entfernt.
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
                Rechtsgrundlage
              </h2>
              <p className="mt-3">
                Die genaue Rechtsgrundlage hängt vom späteren Betrieb ab und
                muss vor dem produktiven Einsatz geprüft werden. In Betracht
                kommen insbesondere Einwilligung, Vertragserfüllung oder
                berechtigtes Interesse nach DSGVO.
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
              <h2 className="text-xl font-bold text-slate-950">Hinweis</h2>
              <p className="mt-3">
                Diese Datenschutzerklärung ist ein Entwurf und ersetzt keine
                rechtliche Prüfung.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
