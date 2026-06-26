import Link from "next/link";

type Section = {
  title: string;
  content: string[];
};

type Variant = "geschaeftskunden" | "endnutzer";

const intro = [
  "Diese Nutzungsbedingungen gelten für die Nutzung von KurzWarten. KurzWarten ist eine digitale Warteschlangen-Lösung, mit der Unternehmen, Praxen, Dienstleister, Einrichtungen und andere Organisationen Warteschlangen digital verwalten können. Die Anwendung ermöglicht insbesondere das Erstellen von Tickets, das Anzeigen von Ticketnummern, das Aufrufen, Bearbeiten, Erledigen und Löschen von Tickets, die Zuordnung zu Bereichen, Räumen, Schaltern oder Mitarbeitern sowie die Erstellung einfacher Tagesstatistiken.",
  "Anbieter von KurzWarten ist:",
  "[Name / Unternehmen]\n[Adresse]\n[E-Mail-Adresse]\n[Website, falls vorhanden]",
  "Diese Nutzungsbedingungen sind in zwei Bereiche unterteilt. Teil A gilt für Unternehmen, Einrichtungen und sonstige Organisationen, die KurzWarten für eigene Zwecke einsetzen. Teil B gilt für wartende Personen, Besucher, Kunden, Patienten oder sonstige Endnutzer, die KurzWarten verwenden, um ein Ticket zu ziehen oder den Status eines Tickets einzusehen.",
];

const businessSections: Section[] = [
  {
    title: "Geltungsbereich für Geschäftskunden",
    content: [
      "Teil A dieser Nutzungsbedingungen gilt für Unternehmen, Praxen, Dienstleister, Einrichtungen, Organisationen und sonstige Geschäftskunden, die KurzWarten für eigene Warteschlangen einsetzen oder testen.",
      "Geschäftskunden können KurzWarten nutzen, um digitale Warteschlangen zu organisieren, Tickets zu verwalten, wartende Personen aufzurufen und einfache statistische Auswertungen zu erhalten.",
      "Abweichende oder ergänzende Vereinbarungen, insbesondere individuelle Angebote, Leistungsbeschreibungen, Preisvereinbarungen, Verträge zur Auftragsverarbeitung oder gesonderte Servicebedingungen, gehen diesen Nutzungsbedingungen vor, soweit sie ausdrücklich vereinbart wurden.",
    ],
  },
  {
    title: "Zweck von KurzWarten",
    content: [
      "KurzWarten ist ein organisatorisches Hilfsmittel zur Verwaltung einfacher digitaler Warteschlangen. Die Anwendung unterstützt Geschäftskunden dabei, Warteprozesse übersichtlicher und effizienter zu gestalten.",
      "KurzWarten trifft jedoch keine eigenen Entscheidungen darüber, welche Person wann bedient, behandelt, beraten oder aufgerufen wird. Die tatsächliche Organisation vor Ort, die Reihenfolge der Bedienung, der Umgang mit besonderen Fällen und die Entscheidung über Priorisierungen bleiben ausschließlich Aufgabe des jeweiligen Geschäftskunden.",
      "KurzWarten ist nicht als Notfall-, Diagnose-, Behandlungs-, Archiv-, Dokumentations-, Kassen-, Patientenverwaltungs- oder Einsatzleitsystem vorgesehen.",
    ],
  },
  {
    title: "Verantwortlichkeit des Geschäftskunden",
    content: [
      "Der Geschäftskunde ist für die konkrete Nutzung von KurzWarten in seinem Betrieb verantwortlich. Dazu gehört insbesondere, dass der Geschäftskunde die Warteschlange korrekt verwaltet, seine Mitarbeiter angemessen einweist, Zugangsdaten schützt, nur erforderliche Daten eingibt und keine unzulässigen oder unnötigen personenbezogenen Daten verarbeitet.",
      "Der Geschäftskunde ist außerdem dafür verantwortlich, wartende Personen angemessen über den Einsatz von KurzWarten zu informieren, soweit dies gesetzlich erforderlich ist. Dies gilt insbesondere dann, wenn personenbezogene Daten verarbeitet werden.",
      "Der Geschäftskunde entscheidet selbst, ob ein Name, eine Nummer, ein Kürzel oder ein anderes Zuordnungsmerkmal zu einem Ticket verwendet wird. Sofern ein Name verwendet wird, sollte nach Möglichkeit nur ein Vorname, eine Abkürzung oder ein neutrales Zuordnungsmerkmal verwendet werden.",
    ],
  },
  {
    title: "Keine Eingabe sensibler Daten",
    content: [
      "KurzWarten ist nicht dafür vorgesehen, sensible Daten oder besondere Kategorien personenbezogener Daten zu erfassen. Insbesondere dürfen keine Diagnosen, Symptome, Behandlungsgründe, Gesundheitsdaten, religiösen oder politischen Angaben, Zahlungsdaten, Ausweisdaten, Notfallinformationen oder vergleichbar sensible Informationen in KurzWarten eingetragen werden.",
      "Dies gilt besonders für Arztpraxen, medizinische Einrichtungen, Beratungsstellen, Behörden und andere sensible Einsatzbereiche. Räume, Bereiche oder Aufrufstellen sollten möglichst neutral bezeichnet werden, zum Beispiel „Raum 1“, „Schalter 2“, „Team A“ oder „Bereich B“.",
      "Der Geschäftskunde ist dafür verantwortlich, seine Mitarbeiter entsprechend anzuweisen und die Nutzung so zu gestalten, dass keine unnötigen sensiblen Informationen verarbeitet werden.",
    ],
  },
  {
    title: "Zugangsdaten und Adminbereich",
    content: [
      "Der Geschäftskunde ist verpflichtet, Zugangsdaten, Passwörter, Adminlinks und sonstige Authentifizierungsinformationen vertraulich zu behandeln und vor dem Zugriff unbefugter Personen zu schützen.",
      "Zugangsdaten dürfen nur an berechtigte Mitarbeiter oder sonstige berechtigte Personen weitergegeben werden. Der Geschäftskunde ist dafür verantwortlich, Zugänge zu sperren oder zu ändern, wenn Mitarbeiter ausscheiden oder nicht mehr berechtigt sind.",
      "Besteht der Verdacht, dass Zugangsdaten missbraucht wurden oder unbefugte Personen Zugriff erhalten haben, muss der Anbieter unverzüglich informiert werden.",
      "Der Anbieter ist berechtigt, Zugänge oder einzelne Funktionen vorübergehend zu sperren, wenn konkrete Anhaltspunkte für Missbrauch, Sicherheitsrisiken, rechtswidrige Nutzung oder Verstöße gegen diese Nutzungsbedingungen bestehen.",
    ],
  },
  {
    title: "Testbetrieb und Verfügbarkeit",
    content: [
      "Soweit KurzWarten kostenlos oder ausdrücklich im Testbetrieb bereitgestellt wird, besteht kein Anspruch auf dauerhafte Bereitstellung, bestimmte Funktionen, bestimmte Verfügbarkeit, bestimmte Antwortzeiten oder bestimmte Fehlerbehebungszeiten.",
      "KurzWarten befindet sich im Aufbau und kann sich technisch, optisch und funktional ändern. Es kann zu Wartungsarbeiten, technischen Störungen, Ausfällen, Fehlanzeigen, Verzögerungen oder Datenverlusten kommen.",
      "Der Anbieter bemüht sich um einen stabilen und sicheren Betrieb, garantiert im Testbetrieb jedoch keine jederzeitige Verfügbarkeit.",
      "Für eine spätere kostenpflichtige Nutzung können gesonderte Regelungen zu Verfügbarkeit, Support, Preisen, Laufzeit, Kündigung und Leistungsumfang vereinbart werden.",
    ],
  },
  {
    title: "Änderungen und Weiterentwicklung",
    content: [
      "Der Anbieter ist berechtigt, KurzWarten weiterzuentwickeln, zu ändern, zu erweitern oder einzelne Funktionen anzupassen, einzuschränken oder zu entfernen, soweit dies aus technischen, rechtlichen, sicherheitsbezogenen, wirtschaftlichen oder betrieblichen Gründen erforderlich oder zweckmäßig ist.",
      "Wesentliche Änderungen für Geschäftskunden werden nach Möglichkeit rechtzeitig angekündigt.",
      "Ein Anspruch auf Beibehaltung bestimmter Funktionen besteht nur, wenn dies ausdrücklich vereinbart wurde.",
    ],
  },
  {
    title: "Datenschutz und Auftragsverarbeitung",
    content: [
      "Informationen zur Verarbeitung personenbezogener Daten ergeben sich aus der Datenschutzerklärung von KurzWarten.",
      "Soweit der Geschäftskunde KurzWarten für eigene Warteschlangen einsetzt und dabei personenbezogene Daten eigener Kunden, Patienten, Besucher oder sonstiger wartender Personen verarbeitet, entscheidet grundsätzlich der Geschäftskunde über Zweck und Mittel dieser Verarbeitung.",
      "Soweit der Anbieter personenbezogene Daten im Auftrag des Geschäftskunden verarbeitet, erfolgt dies auf Grundlage eines Vertrags zur Auftragsverarbeitung. Ein solcher Vertrag ist vor einem produktiven kommerziellen Einsatz abzuschließen, soweit die gesetzlichen Voraussetzungen einer Auftragsverarbeitung vorliegen.",
      "Der Geschäftskunde ist selbst dafür verantwortlich, eine geeignete Rechtsgrundlage für die Verarbeitung personenbezogener Daten zu prüfen, betroffene Personen ordnungsgemäß zu informieren und sicherzustellen, dass keine unnötigen oder unzulässigen Daten in KurzWarten eingegeben werden.",
    ],
  },
  {
    title: "Pflichten des Geschäftskunden",
    content: [
      "Der Geschäftskunde darf KurzWarten nur rechtmäßig und bestimmungsgemäß nutzen. Der Geschäftskunde und dessen Mitarbeiter sind dafür verantwortlich, Tickets korrekt und nur im erforderlichen Umfang zu erstellen.",
      "Untersagt ist insbesondere das Erstellen falscher, unnötiger oder massenhafter Tickets, die Eingabe unzulässiger oder sensibler Daten, die Weitergabe von Zugangsdaten an unbefugte Personen, der Versuch, technische Schutzmaßnahmen zu umgehen, sowie jede Nutzung, die den Betrieb von KurzWarten, die Rechte wartender Personen oder die ordnungsgemäße Verwaltung der Warteschlange beeinträchtigt.",
      "Der Geschäftskunde darf KurzWarten nicht ohne ausdrückliche Zustimmung des Anbieters weiterverkaufen, unterlizenzieren, als eigenes Produkt anbieten oder Dritten als White-Label-Lösung zur Verfügung stellen.",
    ],
  },
  {
    title: "Rechte an KurzWarten",
    content: [
      "Alle Rechte an KurzWarten verbleiben beim Anbieter oder den jeweiligen Rechteinhabern. Dies betrifft insbesondere Software, Quellcode, Benutzeroberfläche, Design, Datenbankstruktur, Texte, Logos, Namen, Konzepte und sonstige Inhalte.",
      "Der Geschäftskunde erhält lediglich ein einfaches, nicht ausschließliches und nicht übertragbares Nutzungsrecht im Rahmen dieser Nutzungsbedingungen und etwaiger gesonderter Vereinbarungen.",
      "Eine Vervielfältigung, Bearbeitung, Weitergabe, Vermietung, Unterlizenzierung, öffentliche Zugänglichmachung, Dekompilierung, Rückentwicklung oder sonstige Verwertung der Software ist ohne ausdrückliche Zustimmung des Anbieters nicht gestattet, soweit dies gesetzlich nicht zwingend erlaubt ist.",
    ],
  },
  {
    title: "Kostenpflichtige Nutzung",
    content: [
      "Soweit KurzWarten kostenlos bereitgestellt wird, besteht kein Anspruch auf dauerhafte kostenlose Nutzung.",
      "Für eine kostenpflichtige Nutzung können gesonderte Preise, Tarife, Laufzeiten, Zahlungsbedingungen, Kündigungsfristen und Leistungsbeschreibungen gelten.",
      "Kostenpflichtige Leistungen entstehen nur, wenn sie ausdrücklich vereinbart werden.",
    ],
  },
  {
    title: "Kündigung und Beendigung",
    content: [
      "Im kostenlosen Testbetrieb kann die Nutzung durch beide Seiten jederzeit beendet werden, sofern keine abweichende Vereinbarung besteht.",
      "Der Anbieter kann die Nutzung insbesondere beenden oder einschränken, wenn KurzWarten eingestellt wird, der Testbetrieb endet, technische oder rechtliche Gründe dies erforderlich machen oder der Geschäftskunde gegen diese Nutzungsbedingungen verstößt.",
      "Nach Beendigung der Nutzung können aktive Tickets gelöscht werden, soweit keine gesetzlichen Pflichten oder gesonderten Vereinbarungen entgegenstehen.",
      "Der Geschäftskunde ist selbst dafür verantwortlich, rechtlich oder betrieblich erforderliche Informationen rechtzeitig zu sichern, soweit eine Sicherung technisch vorgesehen und rechtlich zulässig ist.",
    ],
  },
  {
    title: "Haftung gegenüber Geschäftskunden",
    content: [
      "Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit.",
      "Der Anbieter haftet außerdem unbeschränkt bei Verletzung von Leben, Körper oder Gesundheit.",
      "Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten haftet der Anbieter nur auf den vertragstypischen, vorhersehbaren Schaden. Wesentliche Vertragspflichten sind solche Pflichten, deren Erfüllung die ordnungsgemäße Nutzung von KurzWarten überhaupt erst ermöglicht und auf deren Einhaltung der Geschäftskunde regelmäßig vertrauen darf.",
      "Im Übrigen ist die Haftung, soweit gesetzlich zulässig, ausgeschlossen.",
      "Der Anbieter haftet insbesondere nicht für die konkrete Organisation der Warteschlange vor Ort, für Entscheidungen des Geschäftskunden über Reihenfolgen, Priorisierungen oder Behandlungen, für fehlerhafte Eingaben durch den Geschäftskunden oder dessen Mitarbeiter, für die Eingabe unzulässiger Daten oder für die Nutzung von KurzWarten entgegen diesen Nutzungsbedingungen.",
    ],
  },
];

const enduserSections: Section[] = [
  {
    title: "Geltungsbereich für wartende Personen",
    content: [
      "Teil B dieser Nutzungsbedingungen gilt für wartende Personen, Besucher, Kunden, Patienten oder sonstige Endnutzer, die KurzWarten verwenden, um ein digitales Ticket zu ziehen, eine Ticketnummer wieder aufzurufen oder den Status eines Tickets einzusehen.",
      "Wartende Personen nutzen KurzWarten in der Regel im Zusammenhang mit einem Unternehmen, einer Praxis, einem Dienstleister, einer Einrichtung oder einer anderen Organisation, die KurzWarten für ihre eigene Warteschlange einsetzt.",
    ],
  },
  {
    title: "Nutzung durch wartende Personen",
    content: [
      "Wartende Personen können KurzWarten nutzen, um ein Ticket zu erstellen, eine Ticketnummer einzusehen, den Status eines Tickets aufzurufen oder Informationen zur Warteschlange anzuzeigen.",
      "Die angezeigte Ticketnummer, Warteposition oder geschätzte Wartezeit stellt keine verbindliche Zusage dar, zu einem bestimmten Zeitpunkt oder in einer bestimmten Reihenfolge bedient, behandelt oder aufgerufen zu werden.",
      "Das jeweilige Unternehmen oder die jeweilige Einrichtung kann aus organisatorischen, fachlichen, medizinischen, sicherheitsbezogenen oder sonstigen sachlichen Gründen von der angezeigten Reihenfolge abweichen.",
    ],
  },
  {
    title: "Keine Notfallfunktion",
    content: [
      "KurzWarten ist kein Notfall-, Alarm-, Diagnose- oder Beratungssystem.",
      "In dringenden Fällen, Notfällen oder Situationen, in denen sofortige Hilfe erforderlich ist, dürfen wartende Personen nicht ausschließlich auf KurzWarten vertrauen. Sie müssen sich direkt an das Personal vor Ort, an eine zuständige Stelle oder an den Notruf wenden.",
      "Dies gilt insbesondere bei medizinischen Beschwerden, akuten Schmerzen, Gefahrensituationen oder sonstigen dringenden Anliegen.",
    ],
  },
  {
    title: "Verhalten der Endnutzer",
    content: [
      "Wartende Personen dürfen KurzWarten nur rechtmäßig und bestimmungsgemäß verwenden.",
      "Wenn Tickets ausschließlich durch das Unternehmen, die Einrichtung oder deren Mitarbeiter erstellt werden, dürfen wartende Personen KurzWarten insbesondere dazu nutzen, ihre Ticketnummer einzusehen, den aktuellen Status ihres Tickets aufzurufen oder Informationen zur Warteschlange abzurufen.",
      "Untersagt ist insbesondere die Manipulation fremder Tickets, der Versuch, technische Schutzmaßnahmen zu umgehen, der unbefugte Zugriff auf Adminbereiche, die Nutzung fremder Ticketnummern, die Störung des Betriebs der Anwendung sowie jede Nutzung, die Rechte anderer Personen beeinträchtigt oder den ordnungsgemäßen Ablauf der Warteschlange stört.",
      "Wartende Personen dürfen keine beleidigenden, rechtswidrigen oder sensiblen Inhalte eingeben, sofern Eingabefelder zur Verfügung stehen. Sensible Informationen wie Diagnosen, Beschwerden, Behandlungsgründe oder andere vertrauliche Angaben dürfen nicht über KurzWarten eingegeben werden.",
      "Bei missbräuchlicher Nutzung können Tickets gelöscht, Funktionen eingeschränkt oder weitere geeignete Maßnahmen ergriffen werden. Bei Problemen mit einem Ticket sollten sich wartende Personen an das Personal des jeweiligen Unternehmens oder der jeweiligen Einrichtung wenden.",
    ],
  },
  {
    title: "Umgang mit Ticketdaten",
    content: [
      "Wartende Personen sehen in KurzWarten grundsätzlich nur ihre Ticketnummer und den dazugehörigen Ticketstatus.",
      "Die Ticketnummer sollte sorgfältig aufbewahrt und nicht unnötig an andere Personen weitergegeben werden, da sie zur Anzeige des jeweiligen Tickets verwendet werden kann.",
      "Wartende Personen können über KurzWarten keine Namen oder sonstigen personenbezogenen Zusatzangaben eingeben. Falls Angaben geändert, korrigiert oder gelöscht werden sollen, sollten sich wartende Personen an das Personal des jeweiligen Unternehmens oder der jeweiligen Einrichtung wenden.",
    ],
  },
  {
    title: "Verfügbarkeit für Endnutzer",
    content: [
      "KurzWarten kann zeitweise nicht verfügbar sein, fehlerhafte Angaben anzeigen oder verzögert reagieren. Dies kann insbesondere durch Wartungsarbeiten, technische Störungen, Internetprobleme, Fehler bei Dienstleistern oder fehlerhafte Eingaben entstehen.",
      "Ein Anspruch wartender Personen auf jederzeitige Verfügbarkeit von KurzWarten besteht nicht.",
      "Wenn KurzWarten nicht erreichbar ist oder ein Ticket nicht angezeigt wird, sollten wartende Personen sich an das Personal des jeweiligen Unternehmens oder der jeweiligen Einrichtung wenden.",
    ],
  },
  {
    title: "Datenschutz für Endnutzer",
    content: [
      "Informationen zur Verarbeitung personenbezogener Daten ergeben sich aus der Datenschutzerklärung von KurzWarten sowie gegebenenfalls aus den Datenschutzhinweisen des jeweiligen Unternehmens oder der jeweiligen Einrichtung.",
      "Soweit ein Unternehmen KurzWarten für die eigene Warteschlange einsetzt, ist dieses Unternehmen grundsätzlich für die konkrete Verarbeitung der Daten im Zusammenhang mit der Warteschlange verantwortlich.",
      "Der Anbieter stellt in diesem Fall in der Regel die technische Lösung bereit.",
    ],
  },
  {
    title: "Kosten für wartende Personen",
    content: [
      "Die Nutzung von KurzWarten durch wartende Personen ist grundsätzlich kostenlos, sofern nicht ausdrücklich etwas anderes angegeben wird.",
      "Kostenpflichtige Leistungen gegenüber Verbrauchern entstehen nur, wenn dies klar, verständlich und ausdrücklich vereinbart wird.",
    ],
  },
  {
    title: "Haftung gegenüber Endnutzern",
    content: [
      "Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit.",
      "Der Anbieter haftet außerdem unbeschränkt bei Verletzung von Leben, Körper oder Gesundheit.",
      "Bei leicht fahrlässiger Verletzung wesentlicher Pflichten haftet der Anbieter nur auf den vorhersehbaren, typischen Schaden.",
      "Im Übrigen ist die Haftung, soweit gesetzlich zulässig, ausgeschlossen.",
      "Die Verantwortung für die tatsächliche Organisation der Warteschlange, die Bedienung, Behandlung, Beratung oder Priorisierung vor Ort liegt beim jeweiligen Unternehmen oder der jeweiligen Einrichtung.",
    ],
  },
];

const generalSections: Section[] = [
  {
    title: "Änderungen dieser Nutzungsbedingungen",
    content: [
      "Der Anbieter kann diese Nutzungsbedingungen ändern, wenn dies aufgrund technischer Weiterentwicklung, neuer Funktionen, geänderter rechtlicher Anforderungen, Sicherheitsanforderungen oder sonstiger sachlicher Gründe erforderlich wird.",
      "Die jeweils aktuelle Fassung ist unter [URL einfügen] abrufbar.",
      "Für bestehende kostenpflichtige Geschäftskunden gelten Änderungen nach Maßgabe der jeweiligen vertraglichen Vereinbarung und der gesetzlichen Anforderungen.",
    ],
  },
  {
    title: "Anwendbares Recht",
    content: [
      "Es gilt das Recht der Bundesrepublik Deutschland, soweit dem keine zwingenden gesetzlichen Vorschriften entgegenstehen.",
      "Gegenüber Verbrauchern gilt diese Rechtswahl nur, soweit dadurch keine zwingenden Verbraucherschutzvorschriften des Staates eingeschränkt werden, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat.",
    ],
  },
  {
    title: "Gerichtsstand",
    content: [
      "Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand, soweit gesetzlich zulässig, der Sitz des Anbieters.",
      "Für Verbraucher gelten die gesetzlichen Gerichtsstände.",
    ],
  },
  {
    title: "Salvatorische Regelung",
    content: [
      "Sollte eine Bestimmung dieser Nutzungsbedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
      "An die Stelle der unwirksamen Bestimmung treten die gesetzlichen Vorschriften.",
    ],
  },
];

const variantMeta = {
  geschaeftskunden: {
    href: "/nutzungsbedingungen/geschaeftskunden",
    label: "Für Geschäftskunden",
    title: "Nutzungsbedingungen für Geschäftskunden",
    lead: "Teil A für Unternehmen, Praxen, Einrichtungen und sonstige Organisationen, die KurzWarten selbst einsetzen.",
    primaryHeading:
      "Teil A: Bedingungen für Geschäftskunden, Unternehmen und Einrichtungen",
    primarySections: businessSections,
  },
  endnutzer: {
    href: "/nutzungsbedingungen/endnutzer",
    label: "Für Endnutzer",
    title: "Nutzungsbedingungen für Endnutzer",
    lead: "Teil B für wartende Personen, Besucher, Kunden, Patienten und sonstige Endnutzer.",
    primaryHeading: "Teil B: Bedingungen für wartende Personen und Endnutzer",
    primarySections: enduserSections,
  },
} satisfies Record<
  Variant,
  {
    href: string;
    label: string;
    title: string;
    lead: string;
    primaryHeading: string;
    primarySections: Section[];
  }
>;

function SectionBlock({
  heading,
  sections,
  startAt = 1,
}: {
  heading: string;
  sections: Section[];
  startAt?: number;
}) {
  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        {heading}
      </h2>
      {sections.map((section, index) => (
        <section key={section.title}>
          <h3 className="text-xl font-bold text-slate-950">
            {startAt + index}. {section.title}
          </h3>
          <div className="mt-3 space-y-4 text-slate-700">
            {section.content.map((paragraph) =>
              paragraph.includes("\n") ? (
                <p key={paragraph} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ) : (
                <p key={paragraph}>{paragraph}</p>
              ),
            )}
          </div>
        </section>
      ))}
    </section>
  );
}

export function NutzungsbedingungenContent({ variant }: { variant: Variant }) {
  const meta = variantMeta[variant];

  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-4xl px-5 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Bedingungen
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Nutzungsbedingungen für KurzWarten
          </h1>
          <p className="mt-3 text-sm font-medium text-slate-500">
            Stand: [Datum einfügen]
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {(Object.keys(variantMeta) as Variant[]).map((key) => {
              const item = variantMeta[key];
              const isActive = key === variant;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <p className="mt-6 rounded-lg bg-amber-50 p-4 font-semibold text-amber-900">
            Platzhalter: Diese Bedingungen sind noch nicht final und sollten vor
            einem kommerziellen Start geprüft werden.
          </p>

          <div className="mt-8 space-y-6 text-slate-700">
            {intro.map((paragraph) =>
              paragraph.includes("\n") ? (
                <p key={paragraph} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ) : (
                <p key={paragraph}>{paragraph}</p>
              ),
            )}
          </div>

          <div className="mt-10 space-y-10 leading-7">
            <SectionBlock
              heading={meta.primaryHeading}
              sections={meta.primarySections}
            />

            <SectionBlock
              heading="Teil C: Allgemeine Schlussbestimmungen"
              sections={generalSections}
              startAt={meta.primarySections.length + 1}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
