"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import QrScanner from "@/components/QrScanner";
import { ButtonSpinner } from "@/components/LoadingStates";
import {
  COMPANY_ENVIRONMENTS,
  DEFAULT_COMPANY_ENVIRONMENT,
  normalizeCompanyEnvironment,
  getCompanyEnvironmentCopy,
  type CompanyEnvironment,
} from "@/lib/company-environments";

type Company = {
  id: string;
  name: string;
  slug: string;
  environment_type: string | null;
};

const MAX_COMPANY_NAME_LENGTH = 80;
const MIN_PASSWORD_LENGTH = 4;

export default function HomePage() {
  const [companyName, setCompanyName] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [environmentType, setEnvironmentType] = useState<CompanyEnvironment>(
    DEFAULT_COMPANY_ENVIRONMENT
  );
  const [loginName, setLoginName] = useState("");
  const [company, setCompany] = useState<Company | null>(null);
  const [message, setMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const trimmedCompanyName = companyName.trim();
  const trimmedCompanyPassword = companyPassword.trim();
  const trimmedLoginName = loginName.trim();
  const environmentCopy = getCompanyEnvironmentCopy(environmentType);
  const isNameTooLong = trimmedCompanyName.length > MAX_COMPANY_NAME_LENGTH;
  const isPasswordTooShort =
    trimmedCompanyPassword.length > 0 &&
    trimmedCompanyPassword.length < MIN_PASSWORD_LENGTH;
  const canCreateCompany =
    trimmedCompanyName.length > 0 &&
    trimmedCompanyPassword.length >= MIN_PASSWORD_LENGTH &&
    !isNameTooLong &&
    !isCreating;
  const canOpenCompany = trimmedLoginName.length > 0 && !isLoggingIn;

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

    setLoginMessage("Dieser QR-Code gehört nicht zu einer KurzWarten-Seite.");
  }, []);

  async function createCompany() {
    setMessage("");
    setCompany(null);

    if (!trimmedCompanyName) {
      setMessage(
        `Bitte gib den Namen ${environmentCopy.organizationLabelWithArticle} ein.`
      );
      return;
    }

    if (isNameTooLong) {
      setMessage(
        `Der Name darf maximal ${MAX_COMPANY_NAME_LENGTH} Zeichen lang sein.`
      );
      return;
    }

    if (trimmedCompanyPassword.length < MIN_PASSWORD_LENGTH) {
      setMessage(
        `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`
      );
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedCompanyName,
          password: trimmedCompanyPassword,
          environment_type: environmentType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCompany(data.company);
        setCompanyName("");
        setCompanyPassword("");
      } else {
        setMessage(data.error ?? "Das Konto konnte nicht erstellt werden.");
      }
    } catch {
      setMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsCreating(false);
    }
  }

  async function openCompany() {
    setLoginMessage("");

    if (!trimmedLoginName) {
      setLoginMessage(
        "Bitte gib den Namen der Einrichtung oder des Unternehmens ein."
      );
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/company-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedLoginName }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = `/admin/${data.company.slug}`;
      } else {
        setLoginMessage(
          data.error ?? "Einrichtung oder Unternehmen wurde nicht gefunden."
        );
      }
    } catch {
      setLoginMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="bg-[#f5f7fb] text-slate-950">
      {isScanning && (
        <QrScanner onResult={handleQrResult} onClose={() => setIsScanning(false)} />
      )}

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
            Digitale Warteschlangen für Praxen, Salons, Ämter und Service-Teams
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 md:text-6xl">
            Warten einfacher machen, ohne Menschen zu überfordern.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            KurzWarten gibt Besuchern eine klare Ticketnummer, eine
            verständliche Wartezeit und einen Live-Status. Teams behalten im
            Adminbereich den Überblick und rufen Personen ohne Chaos auf.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-950">1. Ticket</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Name eingeben, Ticket erhalten.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-950">2. Status</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Position und Wartezeit bleiben sichtbar.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-950">3. Aufruf</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Das Team ruft Personen im Dashboard auf.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/warten"
              className="inline-flex rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Kundenseite öffnen
            </Link>
            <button
              onClick={() => setIsScanning(true)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              QR-Code scannen
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-blue-700">Für Teams</p>
            <h2 className="mt-1 text-2xl font-bold">Adminbereich öffnen</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Gib den Namen deiner Einrichtung oder deines Unternehmens ein. Das
              Passwort wird erst auf der Adminseite abgefragt.
            </p>

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Einrichtung oder Unternehmen
            </label>
            <input
              value={loginName}
              onChange={(event) => {
                setLoginName(event.target.value);
                setLoginMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canOpenCompany) {
                  event.preventDefault();
                  void openCompany();
                }
              }}
              className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
              placeholder="z. B. Hausarzt Müller, Salon Schnittpunkt"
            />

            <button
              onClick={openCompany}
              disabled={!canOpenCompany}
              className="mt-5 h-12 w-full rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isLoggingIn ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  Wird geöffnet...
                </span>
              ) : (
                "Weiter zum Adminbereich"
              )}
            </button>

            {loginMessage && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
                {loginMessage}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">
              Neues Konto
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {environmentCopy.accountTitle}
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              Der Name kann nur einmal vergeben werden und wird zur Adresse der
              Warteschlange.
            </p>

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Bereich
            </label>
            <select
              value={environmentType}
              onChange={(event) => {
                setEnvironmentType(normalizeCompanyEnvironment(event.target.value));
                setMessage("");
              }}
              className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
            >
              {COMPANY_ENVIRONMENTS.map((environment) => (
                <option key={environment.id} value={environment.id}>
                  {environment.label}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-semibold text-slate-700">
              {environmentCopy.accountNameLabel}
            </label>
            <input
              value={companyName}
              onChange={(event) => {
                setCompanyName(event.target.value);
                setMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canCreateCompany) {
                  event.preventDefault();
                  void createCompany();
                }
              }}
              className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
              maxLength={MAX_COMPANY_NAME_LENGTH}
              placeholder={environmentCopy.accountNamePlaceholder}
            />

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Admin-Passwort
            </label>
            <input
              value={companyPassword}
              onChange={(event) => {
                setCompanyPassword(event.target.value);
                setMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canCreateCompany) {
                  event.preventDefault();
                  void createCompany();
                }
              }}
              className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-950"
              placeholder="Mindestens 4 Zeichen"
              type="password"
            />

            <div className="mt-3 flex items-center justify-between text-sm">
              <p className={isNameTooLong ? "text-red-700" : "text-slate-500"}>
                Maximal {MAX_COMPANY_NAME_LENGTH} Zeichen
              </p>
              <p className="text-slate-500">
                {trimmedCompanyName.length}/{MAX_COMPANY_NAME_LENGTH}
              </p>
            </div>

            <p
              className={`mt-1 text-sm ${
                isPasswordTooShort ? "text-red-700" : "text-slate-500"
              }`}
            >
              Passwort mindestens {MIN_PASSWORD_LENGTH} Zeichen
            </p>

            <button
              onClick={createCompany}
              disabled={!canCreateCompany}
              className="mt-5 h-12 w-full rounded-lg bg-emerald-700 px-5 font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {isCreating ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  Konto wird erstellt...
                </span>
              ) : (
                "Konto erstellen"
              )}
            </button>

            {message && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
                {message}
              </p>
            )}

            {company && (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">
                  Konto erstellt
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  {company.name}
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <a
                    href={`/warten/${company.slug}`}
                    className="rounded-lg bg-slate-950 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
                  >
                    Kundenseite
                  </a>

                  <a
                    href={`/admin/${company.slug}`}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-950 hover:bg-slate-50"
                  >
                    Adminbereich
                  </a>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
