"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlassCard } from "../../components/GlassCard";
import { VideoBackground } from "../../components/VideoBackground";
import { apiLogin } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiLogin({ phone, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.code ?? "login_failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <VideoBackground
      src="/BG video 2.mp4"
      className="relative min-h-screen"
      overlayClassName="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75"
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10">
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Sign in to postaHUB
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Connecting the digital world to you.
          </p>
        </div>

        <GlassCard className="mt-6 max-w-md p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xxxxxxxx"
                className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 outline-none ring-0 focus:border-white/30"
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 outline-none ring-0 focus:border-white/30"
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[var(--posta-red)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-24px_rgba(220,38,38,0.9)] hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-sm text-white/70">
              New here?{" "}
              <Link
                href="/register"
                className="font-medium text-[var(--posta-yellow)] hover:underline"
              >
                Create an account
              </Link>
            </div>
          </form>
        </GlassCard>
      </div>
    </VideoBackground>
  );
}
