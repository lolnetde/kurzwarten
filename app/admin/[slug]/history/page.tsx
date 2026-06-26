"use client";

import {
  getCurrentAdminSession,
  logoutAdminSession,
} from "@/lib/admin-session";
import { ButtonSpinner, HistorySkeleton, PanelSkeleton } from "@/components/LoadingStates";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
};

type HistoryDay = {
  day: string;
  total: number;
  called: number;
  done: number;
  deleted: number;
};

function formatDay(day: string) {
  const [year, month, date] = day.split("-");
  return `${date}.${month}.${year}`;
}

export default function CompanyHistoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [message, setMessage] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingSavedLogin, setIsCheckingSavedLogin] = useState(true);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const totals = history.reduce(
    (result, day) => ({
      total: result.total + day.total,
      called: result.called + day.called,
      done: result.done + day.done,
      deleted: result.deleted + day.deleted,
    }),
    { total: 0, called: 0, done: 0, deleted: 0 }
  );

  const loadHistory = useCallback(
    async () => {
      setIsLoadingHistory(true);

      try {
        const response = await fetch(`/api/company/${slug}/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        const data = await response.json();

        if (data.success) {
          setHistory(data.history ?? []);
          setMessage("");
        } else {
          setMessage(data.error ?? "Statistiken konnten nicht geladen werden.");
        }
      } catch {
        setMessage("Verbindung fehlgeschlagen. Statistiken konnten nicht geladen werden.");
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/company/${slug}`);
        const data = await response.json();

        if (data.success) {
          setCompany(data.company);

          setIsUnlocking(true);

          const sessionData = await getCurrentAdminSession(slug);

          if (sessionData.success) {
            setCompany(sessionData.company);
            setPassword("");
            setIsUnlocked(true);
            await loadHistory();
          }
        } else {
          setMessage(data.error ?? "Unternehmen wurde nicht gefunden.");
        }
      } catch {
        setMessage("Unternehmen konnte nicht geladen werden.");
      } finally {
        setIsUnlocking(false);
        setIsCheckingSavedLogin(false);
        setIsLoadingCompany(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadHistory, slug]);

  async function unlockHistory() {
    setMessage("");

    if (!password.trim()) {
      setMessage("Bitte gib das Admin-Passwort ein.");
      return;
    }

    setIsUnlocking(true);

    try {
      const response = await fetch("/api/company-admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug, password: password.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        setCompany(data.company);
        setPassword("");
        setIsUnlocked(true);
        await loadHistory();
      } else {
        setMessage(data.error ?? "Login fehlgeschlagen.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsUnlocking(false);
    }
  }

  async function logoutAdmin() {
    await logoutAdminSession(slug);
    setIsUnlocked(false);
    setPassword("");
    setHistory([]);
    setMessage("Abgemeldet.");
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl flex-col justify-center px-5 py-10">
          {(isLoadingCompany || isCheckingSavedLogin) && !company ? (
            <PanelSkeleton />
          ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">
              {company?.name ?? "KurzWarten"}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight">
              Statistiken oeffnen
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              {isCheckingSavedLogin
                ? "Gespeicherte Anmeldung wird geprueft."
                : "Gib das Admin-Passwort ein, um die History zu sehen."}
            </p>

            <label className="mt-7 block text-sm font-semibold text-slate-700">
              Admin-Passwort
            </label>
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && password.trim()) {
                  event.preventDefault();
                  void unlockHistory();
                }
              }}
              className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
              disabled={
                isLoadingCompany ||
                isCheckingSavedLogin ||
                !company ||
                isUnlocking
              }
              placeholder="Passwort"
              type="password"
            />

            <button
              onClick={unlockHistory}
              disabled={
                isLoadingCompany ||
                isCheckingSavedLogin ||
                !company ||
                !password.trim() ||
                isUnlocking
              }
              className="mt-5 h-14 w-full rounded-lg bg-blue-700 px-6 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isLoadingCompany || isUnlocking || isCheckingSavedLogin ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  Wird geprüft...
                </span>
              ) : (
                "Statistiken öffnen"
              )}
            </button>

            <a
              href={`/admin/${slug}`}
              className="mt-3 block rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50"
            >
              Zurueck zum Dashboard
            </a>

            {message && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 font-semibold text-red-700">
                {message}
              </p>
            )}
          </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {company?.name ?? "Unternehmen"}
            </p>
            <h1 className="mt-1 text-4xl font-bold leading-tight">
              History
            </h1>
            <p className="mt-2 text-slate-600">
              Tagesuebersicht fuer erstellte, aufgerufene, erledigte und
              geloeschte Tickets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/admin/${slug}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Dashboard
            </a>
            <button
              onClick={() => loadHistory()}
              disabled={isLoadingHistory}
              className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
            >
              {isLoadingHistory ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  Aktualisiert...
                </span>
              ) : (
                "Aktualisieren"
              )}
            </button>
            <button
              onClick={logoutAdmin}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 hover:bg-red-100"
            >
              Abmelden
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Tickets</p>
            <p className="mt-1 text-3xl font-bold">{totals.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Aufgerufen</p>
            <p className="mt-1 text-3xl font-bold">{totals.called}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Erledigt</p>
            <p className="mt-1 text-3xl font-bold">{totals.done}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Geloescht</p>
            <p className="mt-1 text-3xl font-bold">{totals.deleted}</p>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 font-semibold text-red-700">
            {message}
          </p>
        )}

        <div className="mt-7 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold">Tage</h2>
          </div>

          {isLoadingHistory && (
            <HistorySkeleton />
          )}

          {!isLoadingHistory && history.length === 0 && (
            <p className="p-5 text-slate-600">
              Es gibt noch keine Statistikdaten.
            </p>
          )}

          {history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tag</th>
                    <th className="px-5 py-3 font-semibold">Tickets</th>
                    <th className="px-5 py-3 font-semibold">Aufgerufen</th>
                    <th className="px-5 py-3 font-semibold">Erledigt</th>
                    <th className="px-5 py-3 font-semibold">Geloescht</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {history.map((day) => (
                    <tr key={day.day}>
                      <td className="px-5 py-4 font-semibold">
                        {formatDay(day.day)}
                      </td>
                      <td className="px-5 py-4">{day.total}</td>
                      <td className="px-5 py-4">{day.called}</td>
                      <td className="px-5 py-4">{day.done}</td>
                      <td className="px-5 py-4">{day.deleted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
