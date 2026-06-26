"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ButtonSpinner } from "@/components/LoadingStates";
import { logoutAdminSession } from "@/lib/admin-session";
import {
  COMPANY_ENVIRONMENTS,
  DEFAULT_COMPANY_ENVIRONMENT,
  getCompanyEnvironmentCopy,
  normalizeCompanyEnvironment,
  type CompanyEnvironment,
} from "@/lib/company-environments";
import { useEffect, useState } from "react";

type Company = {
  id: string;
  name: string;
  slug: string;
  environment_type: string | null;
};

const MAX_COMPANY_NAME_LENGTH = 80;
const MIN_PASSWORD_LENGTH = 4;

export default function AdminOverviewPage() {
  const [loginName, setLoginName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [environmentType, setEnvironmentType] = useState<CompanyEnvironment>(
    DEFAULT_COMPANY_ENVIRONMENT
  );
  const [activeAdminCompany, setActiveAdminCompany] = useState<Company | null>(
    null
  );
  const [createdCompany, setCreatedCompany] = useState<Company | null>(null);
  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const trimmedLoginName = loginName.trim();
  const trimmedCompanyName = companyName.trim();
  const trimmedCompanyPassword = companyPassword.trim();
  const environmentCopy = getCompanyEnvironmentCopy(environmentType);
  const isNameTooLong = trimmedCompanyName.length > MAX_COMPANY_NAME_LENGTH;
  const isPasswordTooShort =
    trimmedCompanyPassword.length > 0 &&
    trimmedCompanyPassword.length < MIN_PASSWORD_LENGTH;
  const isLoginSuccessMessage = loginMessage === "Abgemeldet.";
  const canOpenCompany =
    trimmedLoginName.length > 0 && !isLoggingIn && !isCheckingAdminSession;
  const canCreateCompany =
    trimmedCompanyName.length > 0 &&
    trimmedCompanyPassword.length >= MIN_PASSWORD_LENGTH &&
    !isNameTooLong &&
    !isCreating;

  useEffect(() => {
    let isMounted = true;

    async function loadActiveAdminSession() {
      try {
        const response = await fetch("/api/company-admin-session");
        const data = await response.json();

        if (isMounted && data.success) {
          setActiveAdminCompany(data.company);
        }
      } catch {
        // The normal login form remains available if the session check fails.
      } finally {
        if (isMounted) {
          setIsCheckingAdminSession(false);
        }
      }
    }

    void loadActiveAdminSession();

    return () => {
      isMounted = false;
    };
  }, []);

  function openActiveAdminPortal() {
    if (!activeAdminCompany) return;

    window.location.href = `/admin/${activeAdminCompany.slug}`;
  }

  async function logoutActiveAdminSession() {
    if (!activeAdminCompany) return;

    setLoginMessage("");
    setIsLoggingOut(true);

    await logoutAdminSession(activeAdminCompany.slug);

    setActiveAdminCompany(null);
    setIsLoggingOut(false);
    setLoginMessage("Abgemeldet.");
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

  async function createCompany() {
    setRegisterMessage("");
    setCreatedCompany(null);

    if (!trimmedCompanyName) {
      setRegisterMessage(
        `Bitte gib den Namen ${environmentCopy.organizationLabelWithArticle} ein.`
      );
      return;
    }

    if (isNameTooLong) {
      setRegisterMessage(
        `Der Name darf maximal ${MAX_COMPANY_NAME_LENGTH} Zeichen lang sein.`
      );
      return;
    }

    if (trimmedCompanyPassword.length < MIN_PASSWORD_LENGTH) {
      setRegisterMessage(
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
        setCreatedCompany(data.company);
        setCompanyName("");
        setCompanyPassword("");
      } else {
        setRegisterMessage(
          data.error ?? "Das Konto konnte nicht erstellt werden."
        );
      }
    } catch {
      setRegisterMessage("Verbindung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-5xl gap-5 px-5 py-10 lg:grid-cols-2 lg:items-center">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <BrandLogo className="w-[190px]" />
          <p className="mt-5 text-sm font-semibold text-blue-700">
            Für Teams
          </p>
          <h1 className="mt-1 text-4xl font-bold leading-tight">
            {activeAdminCompany ? "Du bist angemeldet" : "Adminbereich öffnen"}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {isCheckingAdminSession
              ? "Wir prüfen, ob du bereits in einem Adminbereich angemeldet bist."
              : activeAdminCompany
                ? `Du bist aktuell im Portal von ${activeAdminCompany.name} angemeldet.`
                : "Gib den Namen deiner Einrichtung oder deines Unternehmens ein. Das Passwort wird anschließend auf der Adminseite abgefragt."}
          </p>

          {isCheckingAdminSession && (
            <div className="mt-7 flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-600">
              <ButtonSpinner />
              Session wird geprüft...
            </div>
          )}

          {!isCheckingAdminSession && activeAdminCompany && (
            <div className="mt-7 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">
                Aktives Portal
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {activeAdminCompany.name}
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={openActiveAdminPortal}
                  className="h-12 rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800"
                >
                  Portal öffnen
                </button>
                <button
                  onClick={logoutActiveAdminSession}
                  disabled={isLoggingOut}
                  className="h-12 rounded-lg border border-red-200 bg-white px-5 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <ButtonSpinner />
                      Wird abgemeldet...
                    </span>
                  ) : (
                    "Abmelden"
                  )}
                </button>
              </div>
            </div>
          )}

          {!isCheckingAdminSession && !activeAdminCompany && (
            <>
              <label className="mt-7 block text-sm font-semibold text-slate-700">
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
            </>
          )}

          {loginMessage && (
            <p
              className={`mt-4 rounded-lg p-3 text-sm font-semibold ${
                isLoginSuccessMessage
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {loginMessage}
            </p>
          )}

          <Link
            href="/home"
            className="mt-4 flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 font-semibold text-slate-800 hover:bg-slate-50"
          >
            Zur Startseite
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">Neues Konto</p>
          <h2 className="mt-1 text-3xl font-bold">
            {environmentCopy.accountTitle}
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Erstelle ein Konto für eine eigene Warteschlange. Der Name kann nur
            einmal vergeben werden.
          </p>

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Bereich
          </label>
          <select
            value={environmentType}
            onChange={(event) => {
              setEnvironmentType(
                normalizeCompanyEnvironment(event.target.value)
              );
              setRegisterMessage("");
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
              setRegisterMessage("");
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
              setRegisterMessage("");
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

          {registerMessage && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
              {registerMessage}
            </p>
          )}

          {createdCompany && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">
                Konto erstellt
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-950">
                {createdCompany.name}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a
                  href={`/warten/${createdCompany.slug}`}
                  className="rounded-lg bg-slate-950 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
                >
                  Kundenseite
                </a>

                <a
                  href={`/admin/${createdCompany.slug}`}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-semibold text-slate-950 hover:bg-slate-50"
                >
                  Adminbereich
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
