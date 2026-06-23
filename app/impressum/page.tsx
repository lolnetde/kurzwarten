export default function ImpressumPage() {
  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            Rechtliches
          </p>
          <h1 className="mt-2 text-4xl font-bold">Impressum</h1>
          <p className="mt-4 rounded-lg bg-amber-50 p-4 font-semibold text-amber-900">
            Platzhalter: Bitte vor Veröffentlichung mit deinen echten Angaben
            ersetzen und rechtlich prüfen lassen.
          </p>

          <div className="mt-8 space-y-8 leading-7 text-slate-700">
            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Angaben gemäß § 5 DDG
              </h2>
              <p className="mt-3">
                KurzWarten / [Name des Betreibers oder Unternehmens]
                <br />
                [Straße und Hausnummer]
                <br />
                [PLZ und Ort]
                <br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">Kontakt</h2>
              <p className="mt-3">
                E-Mail: [deine E-Mail-Adresse]
                <br />
                Telefon: [optional / Telefonnummer]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Verantwortlich für den Inhalt
              </h2>
              <p className="mt-3">
                [Name der verantwortlichen Person]
                <br />
                [Adresse, falls abweichend]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Umsatzsteuer-ID
              </h2>
              <p className="mt-3">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:
                [falls vorhanden]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-950">
                Hinweis
              </h2>
              <p className="mt-3">
                Diese Seite ist ein Platzhalter und ersetzt keine individuelle
                Rechtsberatung.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
