"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "../../../components/GlassCard";
import { VideoBackground } from "../../../components/VideoBackground";
import {
  AdminAccountSummary,
  apiAdminAccountAddRole,
  apiAdminAccountRemoveRole,
  apiAdminSearchAccounts,
} from "../../../lib/api";

const knownRoles = ["citizen", "institution_admin", "verifier_agent", "platform_admin"];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [accounts, setAccounts] = useState<AdminAccountSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => accounts.find((a) => a.id === selectedId) ?? null,
    [accounts, selectedId],
  );

  async function refresh(q?: string) {
    const res = await apiAdminSearchAccounts({ q: q ?? query });
    setAccounts(res.accounts);
    if (!selectedId && res.accounts[0]?.id) setSelectedId(res.accounts[0].id);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError(null);
        const res = await apiAdminSearchAccounts({ q: "" });
        if (!mounted) return;
        setAccounts(res.accounts);
        setSelectedId(res.accounts[0]?.id ?? null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.code ?? "failed_to_load_users");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await refresh(query);
    } catch (err: any) {
      setError(err?.code ?? "search_failed");
    } finally {
      setBusy(false);
    }
  }

  async function onAddRole(role: string) {
    if (!selected) return;
    setError(null);
    setBusy(true);
    try {
      const res = await apiAdminAccountAddRole(selected.id, role);
      setAccounts((prev) => prev.map((a) => (a.id === selected.id ? { ...a, roles: res.roles } : a)));
    } catch (err: any) {
      setError(err?.code ?? "add_role_failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRemoveRole(role: string) {
    if (!selected) return;
    setError(null);
    setBusy(true);
    try {
      const res = await apiAdminAccountRemoveRole(selected.id, role);
      setAccounts((prev) => prev.map((a) => (a.id === selected.id ? { ...a, roles: res.roles } : a)));
    } catch (err: any) {
      setError(err?.code ?? "remove_role_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <VideoBackground
      src="/BG video 2.mp4"
      className="relative min-h-screen"
      overlayClassName="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Admin — Users
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Search accounts, view identity status, and manage roles
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Overview
            </Link>
            <Link
              href="/admin/partners"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Partners
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <GlassCard className="p-6">
            <form onSubmit={onSearch} className="space-y-3">
              <div className="text-sm font-semibold text-white">Search</div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Phone, name, NIDA, or account id"
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-[var(--posta-red)] px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                {busy ? "Searching..." : "Search"}
              </button>
            </form>

            <div className="mt-6 text-sm font-semibold text-white">Results</div>
            {loading ? (
              <div className="mt-3 text-white/70">Loading...</div>
            ) : (
              <div className="mt-3 space-y-2">
                {accounts.length === 0 ? (
                  <div className="text-sm text-white/60">No accounts found.</div>
                ) : (
                  accounts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm backdrop-blur transition ${
                        a.id === selectedId
                          ? "border-white/30 bg-white/15 text-white"
                          : "border-white/15 bg-white/10 text-white/80 hover:bg-white/15"
                      }`}
                    >
                      <div className="font-medium">{a.display_name || "Unnamed"}</div>
                      <div className="text-xs text-white/50">{a.phone_e164}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 lg:col-span-2">
            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {!selected ? (
              <div className="text-white/70">Select a user to view details.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50">Account</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {selected.display_name || "Unnamed"}
                  </div>
                  <div className="text-sm text-white/70">{selected.phone_e164}</div>
                  <div className="mt-2 text-xs text-white/50 break-all">{selected.id}</div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50">Identity</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                      NIDA: {selected.nida_number ?? "not_provided"}
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                      Status: {selected.nida_verification_status}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50">Roles</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selected.roles ?? []).map((r: string) => (
                      <span
                        key={r}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {knownRoles.map((role) => {
                      const has = (selected.roles ?? []).includes(role);
                      return (
                        <div
                          key={role}
                          className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
                        >
                          <div className="text-sm text-white">{role}</div>
                          {has ? (
                            <button
                              onClick={() => onRemoveRole(role)}
                              disabled={busy || role === "platform_admin"}
                              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/15 disabled:opacity-60"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => onAddRole(role)}
                              disabled={busy}
                              className="rounded-full bg-[var(--posta-red)] px-3 py-1 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-xs text-white/55">
                    Role changes are immediate. Removing <span className="font-medium">platform_admin</span> is disabled here for safety.
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </VideoBackground>
  );
}
