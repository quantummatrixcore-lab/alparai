"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { importIncidentsAction } from "@/actions/admin";
import type { ImportIncidentsResult } from "@/actions/admin";
import { cn } from "@/lib/utils";

const SOURCES = [
  { value: "aiaaic_import", labelKey: "csv_import_source_aiaaic", color: "text-purple-400" },
  { value: "aiid_import", labelKey: "csv_import_source_aiid", color: "text-blue-400" },
  { value: "news_curated", labelKey: "csv_import_source_news", color: "text-emerald-400" },
] as const;

interface CsvUploadFormProps {
  locale: string;
}

export function CsvUploadForm({ locale: _locale }: CsvUploadFormProps) {
  const t = useTranslations("admin");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [source, setSource] = useState<string>("aiaaic_import");
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ImportIncidentsResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert(t("csv_only_csv"));
      return;
    }
    setSelectedFile(file);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0] ?? null;
    handleFileChange(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("source", source);

    startTransition(async () => {
      const res = await importIncidentsAction(formData);
      setResult(res);
      if (res.ok) {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  return (
    <div className="border-border-subtle bg-bg-secondary/20 overflow-hidden rounded-2xl border backdrop-blur-md">
      <div className="border-border-subtle border-b px-6 py-5">
        <h2 className="text-lg font-black text-white">{t("csv_title")}</h2>
        <p className="text-fg-secondary mt-1 text-xs">{t("csv_subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {/* Source selector */}
        <div className="space-y-2">
          <label className="text-fg-secondary block text-xs font-bold tracking-wider uppercase">
            {t("csv_source")}
          </label>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSource(s.value)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-xs font-bold transition duration-200",
                  source === s.value
                    ? "border-white/20 bg-white/10 text-white shadow-md"
                    : "text-fg-muted border-white/5 bg-white/5 hover:border-white/10 hover:text-white",
                )}
              >
                <span className={source === s.value ? s.color : ""}>{t(s.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Drag & drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition duration-200",
            isDragging
              ? "border-brand-500/60 bg-brand-500/5"
              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
          )}
        >
          {selectedFile ? (
            <>
              <FileText className="h-8 w-8 text-emerald-400" />
              <span className="text-sm font-bold text-white">{selectedFile.name}</span>
              <span className="text-fg-muted text-xs">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </>
          ) : (
            <>
              <Upload className="text-fg-muted h-8 w-8" />
              <span className="text-fg-secondary text-sm font-semibold">{t("csv_drag_drop")}</span>
              <span className="text-fg-muted text-xs">{t("csv_max_size")}</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedFile || isPending}
          className={cn(
            "bg-brand-600 hover:bg-brand-500 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition duration-200",
            (!selectedFile || isPending) && "cursor-not-allowed opacity-50",
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("csv_importing")}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {t("csv_import_btn")}
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 rounded-xl border p-4 text-sm duration-300",
              result.ok
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-red-500/20 bg-red-500/10",
            )}
          >
            <div className="flex items-start gap-3">
              {result.ok ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              )}
              <div className="space-y-1">
                {result.error && <p className="font-bold text-red-300">{result.error}</p>}
                {result.ok && (
                  <p className="font-bold text-emerald-300">
                    {t("csv_success_msg", {
                      inserted: result.inserted ?? 0,
                      skipped: result.skipped ?? 0,
                    })}
                  </p>
                )}
                {(result.parseErrors?.length ?? 0) > 0 && (
                  <details className="mt-2">
                    <summary className="text-fg-secondary cursor-pointer text-xs font-bold">
                      <AlertTriangle className="mr-1 inline h-3 w-3 text-yellow-400" />
                      {result.parseErrors?.length} {t("csv_parse_error")}
                    </summary>
                    <ul className="text-fg-muted mt-2 space-y-1 text-xs">
                      {result.parseErrors?.slice(0, 10).map((e, idx) => (
                        <li key={idx} className="font-mono">
                          {e.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {(result.errors?.length ?? 0) > 0 && (
                  <details className="mt-2">
                    <summary className="text-fg-secondary cursor-pointer text-xs font-bold">
                      {result.errors?.length} {t("csv_db_error")}
                    </summary>
                    <ul className="text-fg-muted mt-2 space-y-1 text-xs">
                      {result.errors?.map((e, idx) => (
                        <li key={idx} className="font-mono">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
