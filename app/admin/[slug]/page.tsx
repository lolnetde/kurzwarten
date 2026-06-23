"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
};

type Ticket = {
  id: number;
  customer_name: string;
  status: string;
  created_at: string;
};

function getStatusLabel(status: string) {
  if (status === "called") return "Aufgerufen";
  if (status === "done") return "Erledigt";
  return "Wartet";
}

function getStatusClass(status: string) {
  if (status === "called") return "bg-amber-50 text-amber-800 border-amber-200";
  if (status === "done") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-blue-50 text-blue-800 border-blue-200";
}

export default function CompanyAdminPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [password, setPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [loadingTicketId, setLoadingTicketId] = useState<number | null>(null);

  const waitingCount = tickets.filter((ticket) => ticket.status === "waiting").length;
  const calledCount = tickets.filter((ticket) => ticket.status === "called").length;
  const doneCount = tickets.filter((ticket) => ticket.status === "done").length;

  const loadTickets = useCallback(async () => {
    setIsLoadingTickets(true);

    try {
      const response = await fetch(`/api/company/${slug}/tickets`);
      const data = await response.json();

      if (data.success) {
        setCompany(data.company);
        setTickets(data.tickets ?? []);
      } else {
        setMessage(data.error ?? "Tickets konnten nicht geladen werden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Tickets konnten nicht geladen werden.");
    } finally {
      setIsLoadingTickets(false);
    }
  }, [slug]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/company/${slug}`);
        const data = await response.json();

        if (data.success) {
          setCompany(data.company);
        } else {
          setMessage(data.error ?? "Unternehmen wurde nicht gefunden.");
        }
      } catch {
        setMessage("Unternehmen konnte nicht geladen werden.");
      } finally {
        setIsLoadingCompany(false);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [slug]);

  async function unlockAdmin() {
    setMessage("");

    if (!company) {
      setMessage("Unternehmen wurde nicht gefunden.");
      return;
    }

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
        setIsUnlocked(true);
        setPassword("");
        await loadTickets();
      } else {
        setMessage(data.error ?? "Login fehlgeschlagen.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsUnlocking(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    setMessage("");
    setLoadingTicketId(id);

    try {
      const response = await fetch(`/api/company/${slug}/ticket/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.error ?? "Status konnte nicht geändert werden.");
      }

      await loadTickets();
    } catch {
      setMessage("Verbindung fehlgeschlagen. Status wurde nicht geändert.");
    } finally {
      setLoadingTicketId(null);
    }
  }

  async function deleteTicket(id: number) {
    setMessage("");
    setLoadingTicketId(id);

    try {
      const response = await fetch(`/api/company/${slug}/ticket/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.error ?? "Ticket konnte nicht entfernt werden.");
      }

      await loadTickets();
    } catch {
      setMessage("Verbindung fehlgeschlagen. Ticket wurde nicht entfernt.");
    } finally {
      setLoadingTicketId(null);
    }
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
        <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-xl flex-col justify-center px-5 py-10">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">
              {company?.name ?? "KurzWarten"}
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight">
              Adminbereich öffnen
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Gib das Admin-Passwort ein, um die Warteschlange zu verwalten.
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
              className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-white px-4 text-lg text-slate-950"
              disabled={isLoadingCompany || !company || isUnlocking}
              placeholder="Passwort"
              type="password"
            />

            <button
              onClick={unlockAdmin}
              disabled={isLoadingCompany || !company || !password.trim() || isUnlocking}
              className="mt-5 h-14 w-full rounded-lg bg-blue-700 px-6 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isLoadingCompany || isUnlocking ? "Wird geprüft..." : "Dashboard öffnen"}
            </button>

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

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {company?.name ?? "Unternehmen"}
            </p>
            <h1 className="mt-1 text-4xl font-bold leading-tight">
              Warteschlange
            </h1>
            <p className="mt-2 text-slate-600">
              Rufe Patienten oder Kunden auf und halte den Status aktuell.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/warten/${slug}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Kundenseite öffnen
            </a>
            <button
              onClick={loadTickets}
              className="rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Aktualisieren
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Warten</p>
            <p className="mt-1 text-3xl font-bold">{waitingCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Aufgerufen</p>
            <p className="mt-1 text-3xl font-bold">{calledCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Erledigt</p>
            <p className="mt-1 text-3xl font-bold">{doneCount}</p>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 font-semibold text-red-700">
            {message}
          </p>
        )}

        <div className="mt-7 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold">Aktuelle Tickets</h2>
          </div>

          {isLoadingTickets && (
            <p className="p-5 text-slate-600">Tickets werden geladen...</p>
          )}

          {!isLoadingTickets && tickets.length === 0 && (
            <p className="p-5 text-slate-600">
              Aktuell gibt es keine Tickets.
            </p>
          )}

          <div className="divide-y divide-slate-200">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-bold">
                      #{ticket.id} {ticket.customer_name}
                    </p>
                    <span
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusClass(ticket.status)}`}
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Ticket in dieser Warteschlange
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(ticket.id, "called")}
                    disabled={loadingTicketId === ticket.id}
                    className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Aufrufen
                  </button>

                  <button
                    onClick={() => updateStatus(ticket.id, "done")}
                    disabled={loadingTicketId === ticket.id}
                    className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Erledigt
                  </button>

                  <button
                    onClick={() => deleteTicket(ticket.id)}
                    disabled={loadingTicketId === ticket.id}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingTicketId === ticket.id ? "Bitte warten..." : "Entfernen"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
