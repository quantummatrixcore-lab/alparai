"use client";

import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { Provider } from "./api-hub";
import { getApiKeys, saveApiKey, deleteApiKey } from "@/actions/api-keys";
import { useTranslations } from "next-intl";

interface ApiKeyItem {
  provider: string;
  api_key: string;
  tier: string;
  client_type: string;
  created_at: string;
  updated_at: string;
}

export function ApiKeyManager({ providers }: { providers: Provider[] }) {
  const t = useTranslations("admin");
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newTier, setNewTier] = useState<"free" | "developer" | "enterprise">("developer");
  const [newClientType, setNewClientType] = useState<"internal" | "external">("external");
  const [saving, setSaving] = useState(false);

  const fetchKeys = React.useCallback(async () => {
    setLoading(true);
    const res = await getApiKeys();
    if (res.ok && res.data) {
      setKeys(res.data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleDeleteKey = async (provider: string) => {
    if (!confirm(`Are you sure you want to delete the API key for ${provider}?`)) return;
    const res = await deleteApiKey(provider);
    if (res.ok) {
      await fetchKeys();
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvider || !newKey) return;
    setSaving(true);
    const res = await saveApiKey(newProvider, newKey, newTier, newClientType);
    setSaving(false);
    if (res.ok) {
      setIsAddOpen(false);
      setNewProvider("");
      setNewKey("");
      await fetchKeys();
    }
  };

  const getProviderName = (providerId: string) => {
    return providers.find((p) => p.id === providerId.toLowerCase())?.name || providerId;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{t("manage_api_credentials_for_all_integrate")}</p>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("add_key")}
        </button>
      </div>

      {isAddOpen && (
        <form
          onSubmit={handleSaveKey}
          className="space-y-3 rounded-xl border border-white/10 bg-zinc-900/90 p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              type="text"
              placeholder={t("provider_e_g_openai_anthropic")}
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder={t("api_key_value")}
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              required
            />
            <select
              value={newTier}
              onChange={(e) => setNewTier(e.target.value as "free" | "developer" | "enterprise")}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="free">{t("free")}</option>
              <option value="developer">{t("developer")}</option>
              <option value="enterprise">{t("enterprise")}</option>
            </select>
            <select
              value={newClientType}
              onChange={(e) => setNewClientType(e.target.value as "internal" | "external")}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="external">{t("external_hashed")}</option>
              <option value="internal">{t("internal_encrypted")}</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-lg px-3 py-1 text-xs text-zinc-400 hover:text-white"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Key"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-zinc-400">{t("loading_api_keys")}</div>
      ) : keys.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-800/50">
                  <th className="px-6 py-3 text-left font-semibold text-white">{t("provider")}</th>
                  <th className="px-6 py-3 text-left font-semibold text-white">{t("tier")}</th>
                  <th className="px-6 py-3 text-left font-semibold text-white">
                    {t("client_type")}
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-white">
                    {t("api_key_masked")}
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-white">{t("updated")}</th>
                  <th className="px-6 py-3 text-center font-semibold text-white">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr
                    key={key.provider}
                    className="border-b border-white/5 transition-colors hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-3 font-medium text-white">
                      {getProviderName(key.provider)}
                    </td>
                    <td className="px-6 py-3 text-xs text-zinc-300 capitalize">{key.tier}</td>
                    <td className="px-6 py-3 text-xs text-zinc-400 capitalize">
                      {key.client_type}
                    </td>
                    <td className="px-6 py-3">
                      <code className="rounded bg-black/40 px-2 py-1 font-mono text-xs text-zinc-400">
                        {key.api_key}
                      </code>
                    </td>
                    <td className="px-6 py-3 text-xs text-zinc-400">
                      {new Date(key.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteKey(key.provider)}
                          className="text-zinc-400 transition-colors hover:text-red-400"
                          title={t("delete_key")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-12 text-center">
          <p className="text-zinc-400">{t("no_api_keys_configured_yet")}</p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-4 rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30"
          >
            {t("add_your_first_key")}
          </button>
        </div>
      )}
    </div>
  );
}
