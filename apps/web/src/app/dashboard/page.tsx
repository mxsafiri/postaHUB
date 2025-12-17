"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassCard } from "../../components/GlassCard";
import { VideoBackground } from "../../components/VideoBackground";
import { apiLogout, apiMe, MeResponse } from "../../lib/api";

export default function DashboardPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiMe();
        if (!mounted) return;
        setMe(res);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.code ?? "unauthorized");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function onLogout() {
    await apiLogout();
    window.location.href = "/";
  }

  return (
    <VideoBackground
      src="/BG Landing.mp4"
      className="relative min-h-screen"
      overlayClassName="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-white/70">
              postaHUB — Connecting the digital world to you!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Home
            </Link>
            <button
              onClick={onLogout}
              className="rounded-full bg-[var(--posta-red)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
            >
              Logout
            </button>
          </div>
        </div>

        <GlassCard className="mt-8 max-w-2xl p-6">
          {loading ? (
            <div className="text-white/80">Loading...</div>
          ) : error ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
              <Link
                href="/login"
                className="inline-flex rounded-2xl bg-[var(--posta-red)] px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Account
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {me?.account.displayName || "Unnamed"}
                </div>
                <div className="text-sm text-white/70">{me?.account.phoneE164}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Roles
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(me?.roles ?? []).map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </VideoBackground>
  );
}
