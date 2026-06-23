"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

export default function CompanySettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/company/${slug}`);
        const data = await response.json();

        if (data.success) {
          setCompany(data.company);
          setAddress(data.company.address ?? "");
          setPostalCode(data.company.postal_code ?? "");
          setCity(data.company.city ?? "");
        } else {
          setMessageType("error");
          setMessage(data.error ?? "Praxis wurde nicht gefunden.");
        }
      } catch {
        setMessageType("error");
        setMessage("Praxisdaten konnten nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [slug]);

  async function saveSettings() {
    setMessage("");

    if (!password.trim()) {
      setMessageType("error");
      setMessage("Bitte gib das Admin-Passwort ein.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/company/${slug}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password.trim(),
          address,
          postal_code: postalCode,
          city,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompany(data.company);
        setAddress(data.company.address ?? "");
        setPostalCode(data.company.postal_code ?? "");
        setCity(data.company.city ?? "");
        setPassword("");
        setMessageType("success");
        setMessage("Einstellungen gespeichert.");
      } else {
        setMessageType("error");
        setMessage(data.error ?? "Einstellungen konnten nicht gespeichert werden.");
      }
    } catch {
      setMessageType("error");
      setMessage("Verbindung fehlgeschlagen. Einstellungen wurden nicht gespeichert.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-8">
        <a
          href={`/admin/${slug}`}
          className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
        >
          Zurück zum Dashboard
        </a>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-blue-700">
            {company?.name ?? "KurzWarten"}
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">
            Praxisdaten bearbeiten
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            Diese Angaben helfen Patienten, die richtige Praxis über Name,
            Straße, Postleitzahl oder Stadt zu finden.
          </p>

          {isLoading ? (
            <p className="mt-6 rounded-lg bg-slate-50 p-4 font-semibold text-slate-600">
              Praxisdaten werden geladen...
            </p>
          ) : (
            <div className="mt-6 grid gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Straße und Hausnummer
                </label>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                  placeholder="z. B. Musterstraße 12"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Postleitzahl
                  </label>
                  <input
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                    placeholder="z. B. 50667"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Stadt oder Ort
                  </label>
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                    placeholder="z. B. Köln"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Admin-Passwort
                </label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
                  placeholder="Passwort zum Speichern"
                  type="password"
                />
              </div>

              <button
                onClick={saveSettings}
                disabled={isSaving || !company}
                className="h-12 rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {isSaving ? "Speichert..." : "Einstellungen speichern"}
              </button>
            </div>
          )}

          {message && (
            <p
              className={`mt-5 rounded-lg p-3 font-semibold ${
                messageType === "success"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
