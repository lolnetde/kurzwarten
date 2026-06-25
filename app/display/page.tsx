"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonSpinner } from "@/components/LoadingStates";
import { getCompanyEnvironmentCopy } from "@/lib/company-environments";

type CompanySuggestion = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  environment_type: string | null;
};

function formatCompanyLocation(company: CompanySuggestion) {
  return [company.address, company.postal_code, company.city]
    .filter(Boolean)
    .join(", ");
}

export default function DisplayOverviewPage() {
  const [companyName, setCompanyName] = useState("");
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [message, setMessage] = useState("");
  const [isOpening, setIsOpening] = useState(false);

  const trimmedCompanyName = companyName.trim();
  const canOpenDisplay = trimmedCompanyName.length > 0 && !isOpening;

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (trimmedCompanyName.length < 2) {
        setSuggestions([]);
        return;
      }

      const params = new URLSearchParams({ q: trimmedCompanyName });

      try {
        const response = await fetch(`/api/companies/search?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setSuggestions(data.companies ?? []);
        }
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [trimmedCompanyName]);

  async function openDisplay() {
    setMessage("");

    if (!trimmedCompanyName) {
      setMessage("Bitte gib den Namen der Einrichtung oder des Unternehmens ein.");
      return;
    }

    setIsOpening(true);

    try {
      const response = await fetch("/api/company-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedCompanyName }),
      });
      const data = await response.json();

      if (data.success) {
        window.location.href = `/display/${data.company.slug}`;
      } else {
        setMessage(data.error ?? "Diese Display-Anzeige wurde nicht gefunden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl flex-col justify-center px-5 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            Öffentliche Anzeige
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">
            Display öffnen
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Suche nach Name, Bereich, Adresse, Postleitzahl oder Stadt und
            öffne die Ansicht für große Bildschirme.
          </p>

          <label className="mt-7 block text-sm font-semibold text-slate-700">
            Einrichtung oder Unternehmen
          </label>
          <input
            value={companyName}
            onChange={(event) => {
              setCompanyName(event.target.value);
              setMessage("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canOpenDisplay) {
                event.preventDefault();
                void openDisplay();
              }
            }}
            className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
            placeholder="z. B. Bürgeramt Mitte oder Friseur Köln"
          />

          {suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {suggestions.map((company) => {
                const location = formatCompanyLocation(company);
                const environmentCopy = getCompanyEnvironmentCopy(
                  company.environment_type
                );

                return (
                  <button
                    key={company.id}
                    onClick={() => {
                      window.location.href = `/display/${company.slug}`;
                    }}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-blue-50"
                  >
                    <span className="block font-semibold text-slate-950">
                      {company.name}
                    </span>
                    <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {environmentCopy.label}
                    </span>
                    {location && (
                      <span className="mt-1 block text-sm text-slate-500">
                        {location}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={openDisplay}
            disabled={!canOpenDisplay}
            className="mt-5 h-14 w-full rounded-lg bg-blue-700 px-6 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            {isOpening ? (
              <span className="inline-flex items-center justify-center gap-2">
                <ButtonSpinner />
                Wird geöffnet...
              </span>
            ) : (
              "Display anzeigen"
            )}
          </button>

          <Link
            href="/home"
            className="mt-4 flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 font-semibold text-slate-800 hover:bg-slate-50"
          >
            Zur Startseite
          </Link>

          {message && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 font-semibold text-red-700">
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
