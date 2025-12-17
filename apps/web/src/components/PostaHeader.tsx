import Image from "next/image";
import Link from "next/link";

export function PostaHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logonew.png"
          alt="Posta"
          width={140}
          height={40}
          priority
        />
      </Link>
      <nav className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-[var(--posta-red)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_-18px_rgba(220,38,38,0.9)] hover:brightness-110"
        >
          Create account
        </Link>
      </nav>
    </header>
  );
}
