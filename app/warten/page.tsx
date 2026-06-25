"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import QrScanner from "@/components/QrScanner";

type CompanySuggestion = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

function formatCompanyLocation(company: CompanySuggestion) {
  return [company.address, company.postal_code, company.city]
    .filter(Boolean)
    .join(", ");
}

export default function WartenOverviewPage() {
  const [companyName, setCompanyName] = useState("");
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [message, setMessage] = useState("");
  const [isOpening, setIsOpening] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const trimmedCompanyName = companyName.trim();
  const canOpenCompany = trimmedCompanyName.length > 0 && !isOpening;

  const handleQrResult = useCallback((value: string) => {
    setIsScanning(false);

    try {
      const url = new URL(value);

      if (url.pathname.startsWith("/warten/")) {
        window.location.href = url.href;
        return;
      }
    } catch {
      if (value.startsWith("/warten/")) {
        window.location.href = value;
        return;
      }
    }

    setMessage("Dieser QR-Code gehört nicht zu einer KurzWarten-Seite.");
  }, []);

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

  async function openCompanyQueue() {
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
        window.location.href = `/warten/${data.company.slug}`;
      } else {
        setMessage(data.error ?? "Diese Warteschlange wurde nicht gefunden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      {isScanning && (
        <QrScanner onResult={handleQrResult} onClose={() => setIsScanning(false)} />
      )}

      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl flex-col justify-center px-5 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            KurzWarten für Besucher und Kunden
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">
            Warteschlange finden
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Scanne den QR-Code vor Ort oder suche nach Name, Adresse,
            Postleitzahl oder Stadt.
          </p>

          <button
            onClick={() => setIsScanning(true)}
            className="mt-6 h-14 w-full rounded-lg bg-slate-950 px-6 text-lg font-semibold text-white hover:bg-slate-800"
          >
            QR-Code scannen
          </button>

          <div className="my-6 flex items-center gap-3 text-sm font-semibold text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            oder suchen
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Suche
          </label>
          <input
            value={companyName}
            onChange={(event) => {
              setCompanyName(event.target.value);
              setMessage("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canOpenCompany) {
                event.preventDefault();
                void openCompanyQueue();
              }
            }}
            className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
            placeholder="z. B. Köln, Müller oder 50667"
          />

          {suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {suggestions.map((company) => {
                const location = formatCompanyLocation(company);

                return (
                  <button
                    key={company.id}
                    onClick={() => {
                      window.location.href = `/warten/${company.slug}`;
                    }}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-blue-50"
                  >
                    <span className="block font-semibold text-slate-950">
                      {company.name}
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
            onClick={openCompanyQueue}
            disabled={!canOpenCompany}
            className="mt-5 h-14 w-full rounded-lg bg-blue-700 px-6 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            {isOpening ? "Wird geöffnet..." : "Weiter zum Ticket"}
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
