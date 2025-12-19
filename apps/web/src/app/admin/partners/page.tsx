"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "../../../components/GlassCard";
import { VideoBackground } from "../../../components/VideoBackground";
import {
  AdminPartner,
  AdminPartnerApiKey,
  apiAdminCreatePartner,
  apiAdminCreatePartnerKey,
  apiAdminListPartnerKeys,
  apiAdminListPartners,
  apiAdminRevokePartnerKey,
} from "../../../lib/api";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [keys, setKeys] = useState<AdminPartnerApiKey[]>([]);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const selectedPartner = useMemo(
    () => partners.find((p) => p.id === selectedPartnerId) ?? null,
    [partners, selectedPartnerId],
  );

  async function refreshPartners(selectId?: string) {
    const res = await apiAdminListPartners();
    setPartners(res.partners);
    if (selectId) setSelectedPartnerId(selectId);
  }

  async function refreshKeys(partnerId: string) {
    const res = await apiAdminListPartnerKeys(partnerId);
    setKeys(res.keys);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError(null);
        const res = await apiAdminListPartners();
        if (!mounted) return;
        setPartners(res.partners);
        setSelectedPartnerId(res.partners[0]?.id ?? null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.code ?? "failed_to_load_partners");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPartnerId) {
      setKeys([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setError(null);
        const res = await apiAdminListPartnerKeys(selectedPartnerId);
        if (!mounted) return;
        setKeys(res.keys);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.code ?? "failed_to_load_keys");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedPartnerId]);

  async function onCreatePartner(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGeneratedKey(null);
    setBusy(true);
    try {
      const created = await apiAdminCreatePartner({ name: newPartnerName });
      setNewPartnerName("");
      await refreshPartners(created.id);
      await refreshKeys(created.id);
    } catch (err: any) {
      setError(err?.code ?? "create_partner_failed");
    } finally {
      setBusy(false);
    }
  }

  async function onGenerateKey() {
    if (!selectedPartnerId) return;
    setError(null);
    setGeneratedKey(null);
    setBusy(true);
    try {
      const res = await apiAdminCreatePartnerKey(selectedPartnerId);
      setGeneratedKey(res.apiKey);
      await refreshKeys(selectedPartnerId);
    } catch (err: any) {
      setError(err?.code ?? "create_key_failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRevokeKey(keyId: string) {
    if (!selectedPartnerId) return;
    setError(null);
    setBusy(true);
    try {
      await apiAdminRevokePartnerKey(keyId);
      await refreshKeys(selectedPartnerId);
    } catch (err: any) {
      setError(err?.code ?? "revoke_key_failed");
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
              Admin — Partners
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Create partners and manage API keys (platform_admin only)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <GlassCard className="p-6">
            <div className="text-sm font-semibold text-white">Create partner</div>
            <form onSubmit={onCreatePartner} className="mt-4 space-y-3">
              <input
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                placeholder="Partner name"
                className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30"
              />
              <button
                type="submit"
                disabled={busy || !newPartnerName.trim()}
                className="w-full rounded-2xl bg-[var(--posta-red)] px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                {busy ? "Working..." : "Create partner"}
              </button>
            </form>

            <div className="mt-6 text-sm font-semibold text-white">Partners</div>
            {loading ? (
              <div className="mt-3 text-white/70">Loading...</div>
            ) : (
              <div className="mt-3 space-y-2">
                {partners.length === 0 ? (
                  <div className="text-sm text-white/60">No partners yet.</div>
                ) : (
                  partners.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setGeneratedKey(null);
                        setSelectedPartnerId(p.id);
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm backdrop-blur transition ${
                        p.id === selectedPartnerId
                          ? "border-white/30 bg-white/15 text-white"
                          : "border-white/15 bg-white/10 text-white/80 hover:bg-white/15"
                      }`}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-white/50">{p.status}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white">API Keys</div>
                <div className="mt-1 text-sm text-white/60">
                  Partner: {selectedPartner ? selectedPartner.name : "None selected"}
                </div>
              </div>
              <button
                onClick={onGenerateKey}
                disabled={busy || !selectedPartnerId}
                className="rounded-2xl bg-[var(--posta-red)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
              >
                Generate key
              </button>
            </div>

            {generatedKey ? (
              <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-yellow-50/80">
                  New API key (copy now — shown once)
                </div>
                <div className="mt-2 break-all font-mono text-sm text-yellow-50">
                  {generatedKey}
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              {selectedPartnerId ? (
                keys.length === 0 ? (
                  <div className="text-sm text-white/60">No keys yet.</div>
                ) : (
                  keys.map((k) => (
                    <div
                      key={k.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white">
                          Prefix: <span className="font-mono">{k.prefix}</span>
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          Created: {new Date(k.created_at).toLocaleString()}
                          {k.revoked_at ? ` • Revoked: ${new Date(k.revoked_at).toLocaleString()}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRevokeKey(k.id)}
                          disabled={busy || Boolean(k.revoked_at)}
                          className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-60"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div className="text-sm text-white/60">Select a partner to manage keys.</div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </VideoBackground>
  );
}
