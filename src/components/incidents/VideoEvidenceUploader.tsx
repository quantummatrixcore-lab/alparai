"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Video, Upload, Loader2, CheckCircle2, AlertCircle, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoEvidenceUploaderProps {
  incidentId?: string;
  onAnalysis: (summary: string) => void;
}

interface VideoEvent {
  timestamp: number;
  description: string;
}

export function VideoEvidenceUploader({ onAnalysis }: VideoEvidenceUploaderProps) {
  const t = useTranslations("incident");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [events, setEvents] = useState<VideoEvent[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 50MB client-side limit check
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage(t("video_evidence_size_exceeded"));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setSummary(null);
    setEvents([]);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);

      const response = await fetch("/api/incidents/analyze-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || t("video_evidence_failed"));
      }

      const data = await response.json();
      setSummary(data.summary);
      setEvents(data.events || []);
      onAnalysis(data.summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("video_evidence_unknown_error");
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-border bg-bg-surface flex flex-col gap-3 rounded-lg border p-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="text-fg-primary flex items-center gap-2 font-medium">
          <Film className="text-brand-400 h-4 w-4" />
          <span>{t("video_evidence_title")}</span>
        </div>
        <span className="text-fg-muted text-[11px]">{t("video_evidence_max_size")}</span>
      </div>

      <div className="flex items-center gap-3">
        <label className="border-border bg-bg-elevated text-fg-secondary hover:text-fg-primary flex flex-1 cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
          <Video className="text-fg-muted h-4 w-4" />
          <span className="truncate">
            {selectedFile ? selectedFile.name : t("video_evidence_select")}
          </span>
          <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
        </label>

        <Button
          type="button"
          size="sm"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="bg-brand-500 hover:bg-brand-600 flex items-center gap-2 text-white"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>
            {isUploading ? t("video_evidence_analyzing") : t("video_evidence_analyze_btn")}
          </span>
        </Button>
      </div>

      {errorMessage && (
        <div className="border-danger-500/20 bg-danger-500/10 text-danger-400 flex items-center gap-2 rounded border p-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {summary && (
        <div className="border-brand-500/20 bg-brand-500/5 space-y-2 rounded-md border p-3">
          <div className="text-brand-400 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>{t("video_evidence_summary_title")}</span>
          </div>
          <p className="text-fg-secondary leading-relaxed">{summary}</p>

          {events.length > 0 && (
            <div className="border-border-subtle mt-2 space-y-1 border-t pt-2">
              <span className="text-fg-primary font-semibold">
                {t("video_evidence_timeline_events")}
              </span>
              <ul className="space-y-1 pl-2">
                {events.map((ev, idx) => (
                  <li key={idx} className="text-fg-muted flex items-center gap-2">
                    <span className="bg-bg-elevated rounded px-1 font-mono text-[10px]">
                      {ev.timestamp.toFixed(1)}s
                    </span>
                    <span>{ev.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
