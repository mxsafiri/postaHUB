"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard } from "../../components/GlassCard";
import { VideoBackground } from "../../components/VideoBackground";
import { apiAdminOverview, AdminOverviewResponse } from "../../lib/api";

export default function AdminHomePage() {
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiAdminOverview();
      setData(res);
      setLastUpdatedAt(Date.now());
    } catch (err: any) {
      setError(err?.code ?? "failed_to_load_overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await load();
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dbOk = data?.health.db === "ok";
  const updatedLabel = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString()
    : "Not yet";

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
              Admin — Overview
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Platform status, key metrics, and quick actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => load()}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <Link
              href="/admin/partners"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Partners
            </Link>
            <Link
              href="/admin/users"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Users
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${
                dbOk
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                  : "border-red-400/30 bg-red-500/10 text-red-100"
              }`}
            >
              DB: {dbOk ? "OK" : "Error"}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              Updated: {updatedLabel}
            </span>
          </div>
          <div className="text-xs text-white/60">
            Admin tools are non-custodial. Use role changes and partner keys only when authorized.
          </div>
        </div>

        <div className="mt-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <GlassCard className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Platform overview</div>
                  <div className="mt-1 text-xs text-white/60">Core operational metrics</div>
                </div>
                <Link
                  href="/admin"
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur hover:bg-white/15"
                >
                  Admin home
                </Link>
              </div>

              {loading ? (
                <div className="mt-6 text-white/80">Loading...</div>
              ) : error ? (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/50">Accounts</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{data?.counts.accounts ?? 0}</div>
                    <div className="mt-1 text-xs text-white/60">Total registered identities</div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/50">Partners</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{data?.counts.partners ?? 0}</div>
                    <div className="mt-1 text-xs text-white/60">Institutions integrated</div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/50">Audit events (24h)</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{data?.counts.auditLogs24h ?? 0}</div>
                    <div className="mt-1 text-xs text-white/60">Requests and admin actions</div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/50">API Keys (Active)</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{data?.counts.apiKeysActive ?? 0}</div>
                    <div className="mt-1 text-xs text-white/60">Keys currently usable</div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/50">API Keys (Revoked)</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{data?.counts.apiKeysRevoked ?? 0}</div>
                    <div className="mt-1 text-xs text-white/60">Keys disabled historically</div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-white/50">Health</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{dbOk ? "Healthy" : "Degraded"}</div>
                    <div className="mt-1 text-xs text-white/60">Database connectivity check</div>
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-sm font-semibold text-white">Quick actions</div>
              <div className="mt-1 text-xs text-white/60">Common admin workflows</div>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/admin/users"
                  className="inline-flex h-12 items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                >
                  <span>Manage users</span>
                  <span className="text-xs font-medium text-white/70">Search, roles</span>
                </Link>
                <Link
                  href="/admin/partners"
                  className="inline-flex h-12 items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                >
                  <span>Manage partners</span>
                  <span className="text-xs font-medium text-white/70">Onboard, keys</span>
                </Link>
                <Link
                  href="/admin/partners"
                  className="inline-flex h-12 items-center justify-between rounded-2xl bg-[var(--posta-red)] px-5 text-sm font-semibold text-white hover:brightness-110"
                >
                  <span>Create partner + API key</span>
                  <span className="text-xs font-medium text-white/80">Setup access</span>
                </Link>

                <button
                  type="button"
                  disabled
                  className="inline-flex h-12 items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white/60 backdrop-blur"
                >
                  <span>View audit logs</span>
                  <span className="text-xs font-medium text-white/50">Coming soon</span>
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-xs text-white/70">
                Tip: Use <span className="font-semibold text-white">Users</span> to assign roles (e.g. verifier agents). Use <span className="font-semibold text-white">Partners</span> to generate API keys.
              </div>
            </GlassCard>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/partners"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--posta-red)] px-6 text-sm font-semibold text-white hover:brightness-110"
            >
              Manage partners
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
            >
              Manage users
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}
