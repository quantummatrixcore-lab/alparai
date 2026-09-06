"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Square, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceIncidentReporterProps {
  onTranscript: (text: string) => void;
}

export function VoiceIncidentReporter({ onTranscript }: VoiceIncidentReporterProps) {
  const t = useTranslations("incident");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    setStatusMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setStatusMessage(t("voice_incident_mic_error"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const [draftTranscript, setDraftTranscript] = useState<string | null>(null);

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setStatusMessage(t("voice_incident_transcribing"));

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      const response = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t("voice_incident_api_error"));
      }

      const data = await response.json();
      if (data.transcript) {
        setDraftTranscript(data.transcript);
        setStatusMessage(null);
      } else {
        setStatusMessage(t("voice_incident_failed"));
      }
    } catch (err) {
      console.error("Transkript gönderme hatası:", err);
      setStatusMessage(t("voice_incident_no_response"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border-border bg-bg-surface flex flex-col gap-2 rounded-lg border p-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="text-fg-primary flex items-center gap-2 font-medium">
          <Volume2 className="text-brand-400 h-4 w-4" />
          <span>{t("voice_incident_title")}</span>
        </div>

        {isRecording && (
          <div className="text-danger-400 flex animate-pulse items-center gap-2 font-mono">
            <span className="bg-danger-500 h-2 w-2 rounded-full" />
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startRecording}
            disabled={isProcessing}
            className="border-danger-500/30 text-danger-400 hover:bg-danger-500/10 flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="bg-danger-500 flex h-3 w-3 rounded-full" />
            )}
            <span>
              {isProcessing ? t("voice_incident_processing") : t("voice_incident_start_btn")}
            </span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stopRecording}
            className="border-fg-muted text-fg-primary hover:bg-bg-elevated flex items-center gap-2"
          >
            <Square className="text-danger-500 h-3 w-3 fill-red-500" />
            <span>{t("voice_incident_stop_btn")}</span>
          </Button>
        )}

        {statusMessage && (
          <span className="text-fg-muted max-w-[240px] truncate text-xs">{statusMessage}</span>
        )}
      </div>

      {draftTranscript && (
        <div className="border-brand-500/30 bg-brand-500/5 mt-2 flex flex-col gap-2 rounded border p-2 text-xs">
          <div className="text-fg-primary font-semibold">Draft Transcription (AI):</div>
          <div className="text-fg-secondary max-h-24 overflow-y-auto whitespace-pre-wrap italic">
            "{draftTranscript}"
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setDraftTranscript(null)}
            >
              Discard
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => {
                onTranscript(draftTranscript);
                setDraftTranscript(null);
                setStatusMessage(t("voice_incident_appended"));
              }}
            >
              Append to Description
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
