"use client";

import Link from "next/link";
import { useState } from "react";

export default function WartenOverviewPage() {
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [isOpening, setIsOpening] = useState(false);

  const trimmedCompanyName = companyName.trim();
  const canOpenCompany = trimmedCompanyName.length > 0 && !isOpening;

  async function openCompanyQueue() {
    setMessage("");

    if (!trimmedCompanyName) {
      setMessage("Bitte gib den Namen der Praxis oder des Unternehmens ein.");
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
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl flex-col justify-center px-5 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            KurzWarten für Patienten und Kunden
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight">
            Warteschlange finden
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Gib den Namen der Praxis oder des Unternehmens ein. Danach kannst du
            dein Ticket ziehen.
          </p>

          <label className="mt-7 block text-sm font-semibold text-slate-700">
            Name der Praxis oder des Unternehmens
          </label>
          <input
            value={companyName}
            onChange={(event) => {
              setCompanyName(event.target.value);
              setMessage("");
            }}
            className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
            placeholder="z. B. Hausarzt Müller"
          />

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
