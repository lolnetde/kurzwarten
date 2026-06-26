export default function DatenschutzPage() {
  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">Datenschutz</p>
          <h1 className="mt-2 text-4xl font-bold">
            Datenschutzerklärung für KurzWarten
          </h1>
          <p className="mt-4 rounded-lg bg-amber-50 p-4 font-semibold text-amber-900">
            Diese Datenschutzerklärung informiert darüber, welche
            personenbezogenen Daten bei der Nutzung von KurzWarten verarbeitet
            werden. KurzWarten ist eine digitale Warteschlangen-Lösung, mit der
            Unternehmen, Praxen, Dienstleister oder andere Stellen Tickets
            erstellen, verwalten, aufrufen, erledigen und statistisch
            auswerten können.
          </p>

          <div className="mt-8 space-y-8 leading-7 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Verantwortlicher
              </h2>
              <p className="mt-3">
                Verantwortlich für eigene Datenverarbeitungen im Zusammenhang
                mit Betrieb, Bereitstellung und Verwaltung von KurzWarten ist:
                <br />
                [Name / Unternehmen]
                <br />
                [Adresse]
                <br />
                [E-Mail-Adresse]
                <br />
                [Telefonnummer]
                <br />
                [Website]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Rolle von KurzWarten bei Nutzung durch Unternehmen
              </h2>
              <p className="mt-3">
                KurzWarten wird in der Regel von Unternehmen, Praxen,
                Dienstleistern oder anderen Organisationen eingesetzt, um vor
                Ort eine digitale Warteschlange zu verwalten.
              </p>
              <p className="mt-3">
                Soweit ein solches Unternehmen KurzWarten für eigene Zwecke
                einsetzt und darüber entscheidet, ob und welche Daten von
                wartenden Personen erfasst werden, ist grundsätzlich dieses
                Unternehmen für die Datenverarbeitung im Zusammenhang mit der
                konkreten Warteschlange verantwortlich.
              </p>
              <p className="mt-3">
                KurzWarten bzw. der Betreiber von KurzWarten verarbeitet diese
                Daten in diesem Fall als technischer Dienstleister und
                Auftragsverarbeiter im Auftrag des jeweiligen Unternehmens. Mit
                Geschäftskunden wird hierfür vor dem produktiven Einsatz ein
                Vertrag zur Auftragsverarbeitung (AVV) geschlossen.
              </p>
              <p className="mt-3">
                Für eigene Datenverarbeitungen, insbesondere Betrieb der
                Plattform, technische Sicherheit, Fehleranalyse,
                Vertragskommunikation, Kundenverwaltung und Abrechnung, bleibt
                der Betreiber von KurzWarten selbst verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Welche Daten verarbeitet KurzWarten?
              </h2>
              <p className="mt-3">
                Bei der Nutzung von KurzWarten können insbesondere folgende
                Daten verarbeitet werden:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Ticketnummer</li>
                <li>
                  Ticketstatus (z. B. wartend, aufgerufen, erledigt oder
                  gelöscht)
                </li>
                <li>Zugehöriges Unternehmen oder zugehöriger Standort</li>
                <li>Zugeordneter Mitarbeiter, Raum, Bereich oder Schalter</li>
                <li>
                  Erstellungszeitpunkt, Aufrufzeitpunkt, Erledigungszeitpunkt
                  und Löschzeitpunkt
                </li>
                <li>Optional: Name oder Kürzel der wartenden Person</li>
                <li>
                  Technische Zugriffsdaten (z. B. IP-Adresse, Datum und Uhrzeit
                  des Zugriffs, aufgerufene URL, Browsertyp, Betriebssystem,
                  Referrer-URL und Fehlermeldungen)
                </li>
                <li>Im Adminbereich: Zugangsdaten oder Authentifizierungsinformationen</li>
                <li>
                  Lokale Browserdaten (LocalStorage), soweit sie für die Nutzung
                  der App erforderlich sind
                </li>
              </ul>
              <p className="mt-3">
                Ein Name wird nur verarbeitet, wenn das jeweilige Unternehmen
                diese Funktion nutzt und einen Namen zu einem Ticket einträgt
                oder eintragen lässt. Der Name dient ausschließlich dazu, ein
                Ticket vor Ort besser zuzuordnen.
              </p>
              <p className="mt-3">
                KurzWarten ist nicht dafür vorgesehen, Diagnosen,
                Behandlungsgründe, Gesundheitsdaten, besondere Kategorien
                personenbezogener Daten oder sonstige sensible Informationen zu
                erfassen. Nutzer und Geschäftskunden werden gebeten, solche
                Informationen nicht in KurzWarten einzutragen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Zwecke der Verarbeitung
              </h2>
              <p className="mt-3">
                Die Daten werden zu folgenden Zwecken verarbeitet:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Erstellung und Verwaltung digitaler Warteschlangen</li>
                <li>Anzeige von Ticketnummern und Wartepositionen</li>
                <li>Schätzung und Anzeige von Wartezeiten</li>
                <li>
                  Aufruf, Bearbeitung, Erledigung und Löschung von Tickets im
                  Adminbereich
                </li>
                <li>
                  Zuordnung von Tickets zu Bereichen, Mitarbeitern, Räumen oder
                  Schaltern
                </li>
                <li>Erstellung von anonymisierten Tagesstatistiken</li>
                <li>
                  Technische Bereitstellung und Absicherung der App (Stabilität,
                  Fehleranalyse, Missbrauchsvermeidung)
                </li>
                <li>
                  Kommunikation mit Geschäftskunden, Vertragsdurchführung und
                  Abrechnung
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Rechtsgrundlagen
              </h2>
              <p className="mt-3">
                Die Verarbeitung personenbezogener Daten erfolgt auf folgenden
                Rechtsgrundlagen:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Die Verarbeitung von Ticketdaten zur Organisation der
                  Warteschlange erfolgt regelmäßig auf Grundlage von Art. 6
                  Abs. 1 lit. f DSGVO. Das berechtigte Interesse besteht darin,
                  Warteprozesse effizient, nachvollziehbar und nutzerfreundlich
                  zu organisieren.
                </li>
                <li>
                  Soweit die Nutzung von KurzWarten zur Erfüllung oder
                  Anbahnung eines Vertrags mit einem Geschäftskunden
                  erforderlich ist, erfolgt die Verarbeitung auf Grundlage von
                  Art. 6 Abs. 1 lit. b DSGVO.
                </li>
                <li>
                  Soweit gesetzliche Aufbewahrungs- oder Nachweispflichten
                  bestehen (z. B. bei der Abrechnung von Geschäftskunden),
                  erfolgt die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit.
                  c DSGVO.
                </li>
                <li>
                  Technische Zugriffsdaten und Sicherheitsprotokolle werden auf
                  Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeitet. Das
                  berechtigte Interesse besteht in der sicheren, stabilen und
                  fehlerfreien Bereitstellung der App.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Speicherdauer und Löschung
              </h2>
              <p className="mt-3">Aktive Ticketdaten werden so kurz wie möglich gespeichert.</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Tickets mit und ohne Namen werden gelöscht, sobald das Ticket
                  aufgerufen und manuell oder automatisch als erledigt/gelöscht
                  markiert wird. Spätestens um 00:00 Uhr des jeweiligen Tages
                  werden alle Tickets des Tages vollständig aus der aktiven
                  Systemdatenbank entfernt.
                </li>
                <li>
                  Nach der Löschung werden die Daten in eine reine Tagesstatistik
                  überführt. In dieser Tagesstatistik werden ausschließlich
                  aggregierte und vollständig anonymisierte Zahlen gespeichert
                  (z. B. Anzahl erstellter/erledigter Tickets, durchschnittliche
                  Wartezeit). Ein Rückschluss auf konkrete Personen oder Namen
                  ist in der Statistik nicht mehr möglich.
                </li>
                <li>
                  Technische Logs und Sicherheitsprotokolle auf den Servern
                  werden für eine Dauer von maximal 30 Tagen gespeichert, es sei
                  denn, ein Sicherheitsvorfall macht eine längere Aufbewahrung
                  zur Aufklärung erforderlich.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Cookies und lokale Speicherung im Browser
              </h2>
              <p className="mt-3">
                KurzWarten setzt keine Cookies für Werbung, Tracking oder
                Analysezwecke ein.
              </p>
              <p className="mt-3">
                Zur Gewährleistung der Kernfunktionen nutzt die App die lokale
                Speicherung im Browser (LocalStorage) gemäß § 25 Abs. 2 Nr. 2
                TDDDG:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Kundenseite: Die Ticketnummer wird lokal gespeichert, damit
                  das Ticket nach einem Neuladen der Seite oder bei kurzzeitigem
                  Verbindungsverlust wieder angezeigt werden kann. Diese
                  Speicherung wird automatisch entfernt, wenn das Ticket
                  abgeschlossen, gelöscht oder die Warteschlange manuell
                  verlassen wird.
                </li>
                <li>
                  Adminbereich: Hier wird die Sitzung lokal gespeichert, damit
                  eine Anmeldung beim Neuladen der Seite bestehen bleibt. Diese
                  Speicherung wird beim Abmelden (Logout) entfernt.
                </li>
                <li>
                  Darstellung: Die gewählte Darstellung (Heller oder Dunkler
                  Modus) wird lokal gespeichert, um das Design bei einem
                  erneuten Aufruf beizubehalten.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Hosting, Datenbank und technische Dienstleister
              </h2>
              <p className="mt-3">
                KurzWarten wird über spezialisierte externe Cloud-Dienstleister
                betrieben, mit denen entsprechende Verträge zur
                Auftragsverarbeitung (AVV) geschlossen wurden.
              </p>
              <p className="mt-3 font-semibold text-slate-950">
                Hosting und Bereitstellung der App:
              </p>
              <p className="mt-1">
                Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
              </p>
              <p className="mt-2">
                Datenschutzhinweise: [Link zu Vercel Privacy einfügen]
              </p>
              <p className="mt-4 font-semibold text-slate-950">
                Datenbank und Backend-Dienste:
              </p>
              <p className="mt-1">
                Supabase Inc., 970 Toa Payoh North #07-04, Singapur (bzw.
                entsprechende EU-Niederlassung/Instanz)
              </p>
              <p className="mt-2">
                Region des Datenbankprojekts: [z.B. EU-Zentral / Frankfurt]
              </p>
              <p className="mt-2">
                Datenschutzhinweise: [Link zu Supabase Privacy einfügen]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Drittlandübermittlungen
              </h2>
              <p className="mt-3">
                Da die eingesetzten Infrastruktur-Dienstleister (Vercel,
                Supabase) ihren Hauptsitz in den USA bzw. außerhalb der EU
                haben, kann nicht ausgeschlossen werden, dass im Rahmen von
                Wartung, Routing oder Support Daten in ein Drittland übermittelt
                werden.
              </p>
              <p className="mt-3">
                Diese Übermittlung wird über die von der EU-Kommission
                genehmigten Standardvertragsklauseln (Standard Contractual
                Clauses – SCC) sowie, sofern anwendbar, über das EU-US Data
                Privacy Framework abgesichert, um ein angemessenes
                Datenschutzniveau zu garantieren.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Empfänger personenbezogener Daten
              </h2>
              <p className="mt-3">
                Personenbezogene Daten werden nur an folgende Empfänger
                weitergegeben:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>
                  Das jeweilige Unternehmen oder die Organisation, die
                  KurzWarten für die eigene Warteschlange nutzt (gilt für die
                  dort eingegebenen Ticket- und Namensdaten).
                </li>
                <li>
                  Die in Ziffer 8 genannten technischen Hosting- und
                  Datenbankdienstleister.
                </li>
                <li>
                  Steuerberater, Finanzbehörden oder Gerichte, soweit dies zur
                  Abwicklung von kostenpflichtigen Verträgen mit
                  Geschäftskunden gesetzlich zwingend erforderlich ist.
                </li>
              </ul>
              <p className="mt-3">
                Eine Weitergabe oder ein Verkauf von Daten zu Werbefunktionen
                oder Trackingzwecken findet nicht statt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Datensicherheit
              </h2>
              <p className="mt-3">
                KurzWarten setzt moderne technische und organisatorische
                Maßnahmen (TOM) ein, um Ihre Daten vor Verlust und unbefugtem
                Zugriff zu schützen. Dazu gehören:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Eine durchgehend verschlüsselte Übertragung per HTTPS / TLS.</li>
                <li>
                  Strenge Passwort- und Zugriffsbeschränkungen für
                  administrative Bereiche.
                </li>
                <li>
                  Die konsequente automatische Löschung aller Ticketdaten um
                  Mitternacht.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Keine Pflicht zur Namensangabe und sensible Bereiche
              </h2>
              <p className="mt-3">
                Die Nutzung von KurzWarten ist ohne Angabe des echten Namens
                möglich. Sofern ein Unternehmen ein Namensfeld aktiviert, wird
                empfohlen, nur Vornamen, Kürzel oder Nummern einzutragen.
              </p>
              <p className="mt-3">
                Wichtiger Hinweis für Arztpraxen und sensible Bereiche:
                KurzWarten ist nicht für die Verarbeitung von Patientendaten,
                Diagnosen oder sonstigen Gesundheitsdaten nach Art. 9 DSGVO
                konzipiert. Arztpraxen sind verpflichtet, Bereiche oder Aufrufe
                vollkommen neutral (z. B. „Raum 1“, „Schalter B“) zu benennen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Rechte betroffener Personen
              </h2>
              <p className="mt-3">
                Sie haben im Rahmen der gesetzlichen Vorgaben der DSGVO folgende
                Rechte bezüglich Ihrer Daten:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>
                  Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
                </li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
              </ul>
              <p className="mt-3">
                Möchten Sie diese Rechte bezüglich einer konkreten Warteschlange
                vor Ort (z. B. in einer Arztpraxis) geltend machen, wenden Sie
                sich bitte direkt an das jeweilige Unternehmen, da dieses der
                datenschutzrechtlich Verantwortliche für die Warteschlange ist.
                Für Fragen bezüglich der Plattform KurzWarten selbst können Sie
                sich an den in Ziffer 1 genannten Verantwortlichen wenden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Beschwerderecht bei einer Aufsichtsbehörde
              </h2>
              <p className="mt-3">
                Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde
                zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung
                Ihrer personenbezogenen Daten gegen die DSGVO verstößt.
                Zuständig ist in der Regel die Aufsichtsbehörde des Bundeslandes,
                in dem der in Ziffer 1 genannte Verantwortliche seinen Sitz hat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Automatisierte Entscheidungen und Profiling
              </h2>
              <p className="mt-3">
                Eine automatisierte Entscheidungsfindung einschließlich Profiling
                im Sinne von Art. 22 DSGVO findet nicht statt. Die technische
                Schätzung von Wartezeiten dient lediglich der organisatorischen
                Anzeige und entfaltet keine rechtliche Wirkung gegenüber
                Nutzern.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Änderungen dieser Datenschutzerklärung
              </h2>
              <p className="mt-3">
                Diese Datenschutzerklärung kann angepasst werden, wenn sich
                technische Funktionen oder rechtliche Vorgaben ändern. Die
                jeweils aktuelle Version ist permanent unter [URL zur
                Datenschutzerklärung einfügen, z. B.
                https://mywait.de/datenschutz] abrufbar.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
