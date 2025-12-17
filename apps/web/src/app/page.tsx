import Link from "next/link";
import { GlassCard } from "../components/GlassCard";
import { PostaHeader } from "../components/PostaHeader";
import { VideoBackground } from "../components/VideoBackground";

export default function Home() {
  return (
    <VideoBackground
      src="/BG Landing.mp4"
      className="relative min-h-screen"
      overlayClassName="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/75"
    >
      <PostaHeader />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white/85 backdrop-blur">
              Posta InnovationHUB
            </div>

            <GlassCard className="mt-4 p-6 sm:p-8">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Connecting the digital world to you!
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
                Built for national scale. Designed for trust.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--posta-red)] px-6 text-sm font-semibold text-white shadow-[0_20px_60px_-28px_rgba(220,38,38,0.95)] hover:brightness-110"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-6 text-sm font-semibold text-white/90 hover:bg-black/30"
                >
                  Dashboard
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </VideoBackground>
  );
}
