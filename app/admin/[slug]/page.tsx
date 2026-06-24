"use client";

import QRCode from "qrcode";
import {
  clearAdminPassword,
  getSavedAdminPassword,
  saveAdminPassword,
} from "@/lib/admin-session";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useParams } from "next/navigation";

type Company = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
};

type Ticket = {
  id: number;
  ticket_number: number;
  queue_position: number | null;
  ticket_day: string;
  customer_name: string;
  status: string;
  created_at: string;
  doctor_id: string | null;
  doctors: Doctor | null;
};

type Doctor = {
  id: string;
  name: string;
  treatment_time_min: number;
  treatment_time_max: number;
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

function RefreshIcon({ isLoading }: { isLoading: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 11a8 8 0 0 0-14.6-4.5L4 8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M4 4v4h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M4 13a8 8 0 0 0 14.6 4.5L20 16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M20 20v-4h-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function NameIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M15.8 11.2a4 4 0 1 0-7.6 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M4.8 20a7.2 7.2 0 0 1 14.4 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m5 12 4.2 4.2L19 6.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 7h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8 7h8M8 12h8M8 17h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function CompanyAdminPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [company, setCompany] = useState<Company | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [ticketDoctorFilter, setTicketDoctorFilter] = useState("all");
  const [draggedTicketId, setDraggedTicketId] = useState<number | null>(null);
  const [dragOverTicketId, setDragOverTicketId] = useState<number | null>(null);
  const [pendingTicketOrder, setPendingTicketOrder] = useState<number[] | null>(
    null
  );
  const [password, setPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isCheckingSavedLogin, setIsCheckingSavedLogin] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [loadingTicketId, setLoadingTicketId] = useState<number | null>(null);
  const [editingNameTicketId, setEditingNameTicketId] = useState<number | null>(
    null
  );
  const [nameDraft, setNameDraft] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [newTicketNumber, setNewTicketNumber] = useState<number | null>(null);
  const [newTicketDoctorName, setNewTicketDoctorName] = useState("");
  const [queueUrl, setQueueUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const ticketRowRefs = useRef(new Map<number, HTMLDivElement>());
  const previousTicketRects = useRef(new Map<number, DOMRect>());

  const waitingCount = tickets.filter((ticket) => ticket.status === "waiting").length;
  const calledCount = tickets.filter((ticket) => ticket.status === "called").length;
  const doneCount = tickets.filter((ticket) => ticket.status === "done").length;
  const canReorderTickets = ticketDoctorFilter !== "all";
  const visibleTickets =
    ticketDoctorFilter === "all"
      ? tickets
      : tickets
          .filter((ticket) => ticket.doctor_id === ticketDoctorFilter)
          .sort((firstTicket, secondTicket) => {
            const firstPosition =
              firstTicket.queue_position ?? firstTicket.ticket_number;
            const secondPosition =
              secondTicket.queue_position ?? secondTicket.ticket_number;

            if (firstPosition !== secondPosition) {
              return firstPosition - secondPosition;
            }

            return firstTicket.ticket_number - secondTicket.ticket_number;
          });

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

  useLayoutEffect(() => {
    if (previousTicketRects.current.size === 0) return;

    ticketRowRefs.current.forEach((element, ticketId) => {
      const previousRect = previousTicketRects.current.get(ticketId);

      if (!previousRect) return;

      const nextRect = element.getBoundingClientRect();
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaY) < 1) return;

      element.animate(
        [
          { transform: `translateY(${deltaY}px)` },
          { transform: "translateY(0)" },
        ],
        {
          duration: 180,
          easing: "cubic-bezier(0.2, 0, 0, 1)",
        }
      );
    });

    previousTicketRects.current = new Map();
  }, [visibleTickets]);

  const loadDoctors = useCallback(async () => {
    try {
      const response = await fetch(`/api/company/${slug}/doctors`);
      const data = await response.json();

      if (data.success) {
        const loadedDoctors = data.doctors ?? [];
        setDoctors(loadedDoctors);
        setSelectedDoctorId((currentDoctorId) => {
          if (
            currentDoctorId &&
            loadedDoctors.some((doctor: Doctor) => doctor.id === currentDoctorId)
          ) {
            return currentDoctorId;
          }

          return loadedDoctors[0]?.id ?? "";
        });
      } else {
        setMessage(data.error ?? "Aerzte konnten nicht geladen werden.");
      }
    } catch {
      setMessage("Aerzte konnten nicht geladen werden.");
    }
  }, [slug]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const customerUrl = `${window.location.origin}/warten/${slug}`;

      setQueueUrl(customerUrl);

      void QRCode.toDataURL(customerUrl, {
        errorCorrectionLevel: "M",
        margin: 2,
        scale: 8,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      }).then(setQrCodeUrl);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [slug]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/company/${slug}`);
        const data = await response.json();

        if (data.success) {
          setCompany(data.company);

          const savedPassword = getSavedAdminPassword(slug);

          if (savedPassword) {
            setIsUnlocking(true);

            const loginResponse = await fetch("/api/company-admin-login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ slug, password: savedPassword }),
            });
            const loginData = await loginResponse.json();

            if (loginData.success) {
              setCompany(loginData.company);
              setIsUnlocked(true);
              await Promise.all([loadTickets(), loadDoctors()]);
            } else {
              clearAdminPassword(slug);
            }
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
  }, [loadDoctors, loadTickets, slug]);

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
        saveAdminPassword(slug, password.trim());
        setPassword("");
        await Promise.all([loadTickets(), loadDoctors()]);
      } else {
        setMessage(data.error ?? "Login fehlgeschlagen.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsUnlocking(false);
    }
  }

  function logoutAdmin() {
    clearAdminPassword(slug);
    setIsUnlocked(false);
    setPassword("");
    setTickets([]);
    setDoctors([]);
    setSelectedDoctorId("");
    setTicketDoctorFilter("all");
    setNewTicketNumber(null);
    setNewTicketDoctorName("");
    setMessage("Abgemeldet.");
  }

  async function createAdminTicket() {
    setMessage("");
    setNewTicketNumber(null);
    setNewTicketDoctorName("");

    if (!selectedDoctorId) {
      setMessage("Bitte lege in den Einstellungen mindestens einen Arzt an.");
      return;
    }

    setIsCreatingTicket(true);

    try {
      const response = await fetch(`/api/company/${slug}/ticket/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctor_id: selectedDoctorId }),
      });

      const data = await response.json();

      if (data.success) {
        setNewTicketNumber(data.ticket.ticket_number);
        setNewTicketDoctorName(data.ticket.doctor?.name ?? "");
        await loadTickets();
      } else {
        setMessage(data.error ?? "Ticket konnte nicht erstellt werden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Ticket wurde nicht erstellt.");
    } finally {
      setIsCreatingTicket(false);
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

  function rememberTicketRowPositions() {
    const currentRects = new Map<number, DOMRect>();

    ticketRowRefs.current.forEach((element, ticketId) => {
      currentRects.set(ticketId, element.getBoundingClientRect());
    });

    previousTicketRects.current = currentRects;
  }

  function applyTicketOrderPreview(nextTicketIds: number[]) {
    rememberTicketRowPositions();

    setTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        const nextPosition = nextTicketIds.indexOf(ticket.id);

        if (nextPosition === -1) {
          return ticket;
        }

        return {
          ...ticket,
          queue_position: nextPosition + 1,
        };
      })
    );
    setPendingTicketOrder(nextTicketIds);
  }

  function previewDraggedTicketOrder(targetTicketId: number) {
    if (!canReorderTickets || draggedTicketId === null) return;
    if (draggedTicketId === targetTicketId) return;
    if (dragOverTicketId === targetTicketId) return;

    const currentTicketIds = visibleTickets.map((ticket) => ticket.id);
    const fromIndex = currentTicketIds.indexOf(draggedTicketId);
    const toIndex = currentTicketIds.indexOf(targetTicketId);

    if (fromIndex === -1 || toIndex === -1) return;

    const nextTicketIds = [...currentTicketIds];
    const [movedTicketId] = nextTicketIds.splice(fromIndex, 1);
    nextTicketIds.splice(toIndex, 0, movedTicketId);

    applyTicketOrderPreview(nextTicketIds);
    setDragOverTicketId(targetTicketId);
  }

  async function saveTicketOrder(ticketIds: number[]) {
    try {
      const response = await fetch(`/api/company/${slug}/ticket/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctor_id: ticketDoctorFilter,
          ticket_ids: ticketIds,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        setMessage(data.error ?? "Reihenfolge konnte nicht gespeichert werden.");
        await loadTickets();
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Reihenfolge wurde nicht gespeichert.");
      await loadTickets();
    }
  }

  async function finishTicketReorder() {
    const finalTicketOrder = pendingTicketOrder;

    setDraggedTicketId(null);
    setDragOverTicketId(null);
    setPendingTicketOrder(null);

    if (!canReorderTickets || !finalTicketOrder) return;

    await saveTicketOrder(finalTicketOrder);
  }

  function handleTicketDragStart(
    event: DragEvent<HTMLDivElement>,
    ticketId: number
  ) {
    if (!canReorderTickets) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(ticketId));
    setDraggedTicketId(ticketId);
    setDragOverTicketId(null);
    setPendingTicketOrder(null);
  }

  function handleTicketDragOver(event: DragEvent<HTMLDivElement>) {
    if (!canReorderTickets || draggedTicketId === null) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleTicketDragEnter(
    event: DragEvent<HTMLDivElement>,
    targetTicketId: number
  ) {
    if (!canReorderTickets || draggedTicketId === null) return;

    event.preventDefault();
    previewDraggedTicketOrder(targetTicketId);
  }

  function handleTicketDrop(event: DragEvent<HTMLDivElement>) {
    if (!canReorderTickets) return;

    event.preventDefault();
  }

  function startEditingName(ticket: Ticket) {
    setEditingNameTicketId(ticket.id);
    setNameDraft(ticket.customer_name === "Vor Ort" ? "" : ticket.customer_name);
    setMessage("");
  }

  function cancelEditingName() {
    setEditingNameTicketId(null);
    setNameDraft("");
  }

  async function saveTicketName(ticketId: number) {
    const trimmedName = nameDraft.trim();
    setMessage("");

    if (!trimmedName) {
      setMessage("Bitte gib einen Namen ein.");
      return;
    }

    if (trimmedName.length > 80) {
      setMessage("Der Name darf maximal 80 Zeichen lang sein.");
      return;
    }

    setIsSavingName(true);
    setLoadingTicketId(ticketId);

    try {
      const response = await fetch(`/api/company/${slug}/ticket/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ticketId, customer_name: trimmedName }),
      });

      const data = await response.json();

      if (data.success) {
        setTickets((currentTickets) =>
          currentTickets.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, customer_name: trimmedName }
              : ticket
          )
        );
        cancelEditingName();
      } else {
        setMessage(data.error ?? "Name konnte nicht gespeichert werden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Name wurde nicht gespeichert.");
    } finally {
      setIsSavingName(false);
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
              {isCheckingSavedLogin
                ? "Gespeicherte Anmeldung wird geprueft."
                : "Gib das Admin-Passwort ein, um die Warteschlange zu verwalten."}
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
                  void unlockAdmin();
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
              onClick={unlockAdmin}
              disabled={
                isLoadingCompany ||
                isCheckingSavedLogin ||
                !company ||
                !password.trim() ||
                isUnlocking
              }
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
              Erstelle Ticketnummern vor Ort und rufe sie im Dashboard auf.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/warten/${slug}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            >
              Kundenseite öffnen
            </a>
            <a
              href={`/admin/${slug}/settings`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            >
              Einstellungen
            </a>
            <a
              href={`/admin/${slug}/history`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            >
              History
            </a>
            <button
              onClick={logoutAdmin}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700 transition hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-sm"
            >
              Abmelden
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

        <div className="mt-7 grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-800">
              Ausgabe am Empfang
            </p>
            <h2 className="mt-1 text-xl font-bold">Neues Ticket erstellen</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Erstelle hier eine Nummer und gib sie der Person vor Ort. Diese
              Nummer wird später auf der Kundenseite eingegeben.
            </p>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Arzt
            </label>
            <select
              value={selectedDoctorId}
              onChange={(event) => setSelectedDoctorId(event.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-blue-200 bg-white px-4 font-semibold text-slate-950"
            >
              {doctors.length === 0 && (
                <option value="">Kein Arzt angelegt</option>
              )}
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>

            {doctors.length === 0 && (
              <a
                href={`/admin/${slug}/settings`}
                className="mt-3 block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900"
              >
                Erst in den Einstellungen Aerzte anlegen
              </a>
            )}

            <button
              onClick={createAdminTicket}
              disabled={isCreatingTicket || doctors.length === 0}
              className="mt-4 h-14 w-full rounded-lg bg-blue-700 px-5 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isCreatingTicket ? "Ticket wird erstellt..." : "Ticket erstellen"}
            </button>

            {newTicketNumber && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-white p-5 text-center">
                <p className="text-sm font-semibold text-blue-800">
                  Neue Ticketnummer
                </p>
                <p className="mt-1 text-6xl font-bold text-blue-950">
                  #{newTicketNumber}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Diese Nummer an die Person weitergeben.
                </p>
                {newTicketDoctorName && (
                  <p className="mt-1 text-sm font-semibold text-blue-800">
                    Zugeordnet: {newTicketDoctorName}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">
              QR-Code für die Praxis
            </p>
            <h2 className="mt-1 text-xl font-bold">Kundenseite scannen</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Patienten scannen den QR-Code und geben dort ihre Ticketnummer
              ein. Der QR-Code führt direkt zur Warteschlange.
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-[260px_1fr] md:items-center">
              <div className="flex justify-center rounded-lg border border-slate-200 bg-white p-4">
                {qrCodeUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeUrl}
                    alt={`QR-Code für ${company?.name ?? "die Kundenseite"}`}
                    className="h-56 w-56"
                  />
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                    QR-Code wird erstellt...
                  </div>
                )}
              </div>

              <div>
                <p className="break-all rounded-lg bg-slate-50 p-4 font-mono text-sm text-slate-700">
                  {queueUrl}
                </p>
                <div className="mt-4 grid gap-2">
                  <a
                    href={queueUrl}
                    className="rounded-lg bg-slate-950 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
                  >
                    Kundenseite öffnen
                  </a>
                  {qrCodeUrl && (
                    <a
                      href={qrCodeUrl}
                      download={`kurzwarten-${slug}-qr-code.png`}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      QR-Code herunterladen
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 font-semibold text-red-700">
            {message}
          </p>
        )}

        <div className="mt-7 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">Aktuelle Tickets</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={ticketDoctorFilter}
                onChange={(event) => setTicketDoctorFilter(event.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
                aria-label="Ticketliste nach Arzt filtern"
              >
                <option value="all">Alle Tickets</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
              {canReorderTickets && (
                <span className="text-sm font-semibold text-slate-500">
                  Ziehen zum Sortieren
                </span>
              )}
              <button
                onClick={loadTickets}
                disabled={isLoadingTickets}
                title="Aktuelle Tickets neu laden"
                aria-label="Aktuelle Tickets neu laden"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-blue-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshIcon isLoading={isLoadingTickets} />
              </button>
            </div>
          </div>

          {isLoadingTickets && (
            <p className="p-5 text-slate-600">Tickets werden geladen...</p>
          )}

          {!isLoadingTickets && visibleTickets.length === 0 && (
            <p className="p-5 text-slate-600">
              {tickets.length === 0
                ? "Aktuell gibt es keine Tickets."
                : "Für diese Auswahl gibt es keine Tickets."}
            </p>
          )}

          <div className="divide-y divide-slate-200">
            {visibleTickets.map((ticket) => (
              <div
                key={ticket.id}
                ref={(element) => {
                  if (element) {
                    ticketRowRefs.current.set(ticket.id, element);
                  } else {
                    ticketRowRefs.current.delete(ticket.id);
                  }
                }}
                draggable={canReorderTickets}
                onDragStart={(event) => handleTicketDragStart(event, ticket.id)}
                onDragEnter={(event) => handleTicketDragEnter(event, ticket.id)}
                onDragOver={handleTicketDragOver}
                onDrop={handleTicketDrop}
                onDragEnd={() => void finishTicketReorder()}
                className={`transform-gpu px-5 py-4 transition-[background-color,box-shadow,opacity,transform] duration-200 ease-out ${
                  canReorderTickets ? "cursor-grab active:cursor-grabbing" : ""
                } ${
                  draggedTicketId === ticket.id
                    ? "scale-[0.99] bg-blue-50 opacity-70 shadow-sm ring-1 ring-blue-200"
                    : ""
                } ${
                  dragOverTicketId === ticket.id && draggedTicketId !== ticket.id
                    ? "bg-slate-50"
                    : ""
                }`}
              >
                <div className="grid gap-3 lg:grid-cols-[10.5rem_minmax(0,1fr)_24rem] lg:items-center">
                  <div className="flex shrink-0 items-center gap-2">
                    {canReorderTickets && (
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500"
                        title="Ticket verschieben"
                        aria-hidden="true"
                      >
                        <MoveIcon />
                      </span>
                    )}
                    <span
                      className={`inline-flex w-32 justify-center rounded-full border px-3 py-1 text-sm font-semibold ${getStatusClass(ticket.status)}`}
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl">
                    <span className="font-bold">
                      Ticket #{ticket.ticket_number}
                    </span>
                    </p>
                    <p className="text-base text-slate-600">
                    Name:{" "}
                    <span className="font-bold text-slate-950">
                      {ticket.customer_name && ticket.customer_name !== "Vor Ort"
                        ? ticket.customer_name
                        : "-"}
                    </span>
                    </p>
                    <p className="text-base text-slate-600">
                    Arzt:{" "}
                    <span className="font-bold text-slate-950">
                      {ticket.doctors ? ticket.doctors.name : "-"}
                    </span>
                    </p>
                  </div>
                  <div className="flex w-full shrink-0 flex-wrap items-center justify-start gap-2 lg:w-[24rem] lg:flex-nowrap lg:justify-end">
                    {editingNameTicketId !== ticket.id && (
                    <button
                      onClick={() => startEditingName(ticket)}
                      className="inline-flex w-40 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                    >
                      <NameIcon />
                      {ticket.customer_name && ticket.customer_name !== "Vor Ort"
                        ? "Name ändern"
                        : "Name hinzufügen"}
                    </button>
                    )}
                    <button
                    onClick={() => updateStatus(ticket.id, "called")}
                    disabled={loadingTicketId === ticket.id}
                    className="w-28 rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Aufrufen
                    </button>

                    <button
                    onClick={() => updateStatus(ticket.id, "done")}
                    disabled={loadingTicketId === ticket.id}
                    title="Erledigt"
                    aria-label={`Ticket ${ticket.ticket_number} erledigen`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckIcon />
                    </button>

                    <button
                    onClick={() => deleteTicket(ticket.id)}
                    disabled={loadingTicketId === ticket.id}
                    title="Entfernen"
                    aria-label={`Ticket ${ticket.ticket_number} entfernen`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <TrashIcon />
                    </button>
                  </div>
                </div>

                {editingNameTicketId === ticket.id && (
                  <div className="mt-3 flex max-w-xl flex-col gap-2 sm:flex-row">
                    <input
                      value={nameDraft}
                      onChange={(event) => {
                        setNameDraft(event.target.value);
                        setMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void saveTicketName(ticket.id);
                        }

                        if (event.key === "Escape") {
                          event.preventDefault();
                          cancelEditingName();
                        }
                      }}
                      className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-slate-950"
                      maxLength={80}
                      placeholder="Name der Person"
                      autoFocus
                    />
                    <button
                      onClick={() => saveTicketName(ticket.id)}
                      disabled={isSavingName || !nameDraft.trim()}
                      className="h-11 rounded-lg bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={cancelEditingName}
                      disabled={isSavingName}
                      className="h-11 rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Abbrechen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
