import React from "react";

export interface AdminPageProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

// FAZ-admin: tüm admin sayfaları için tek tip başlık kabuğu.
// Başlık hiyerarşisini (eyebrow + h1 + açıklama + eylemler) standartlaştırır.
export function AdminPage({ eyebrow, title, description, actions, children }: AdminPageProps) {
  return (
    <div className="space-y-6">
      <div className="border-admin-border flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
        <div>
          {eyebrow ? (
            <div className="mb-1.5 flex items-center gap-2">
              <span className="border-admin-border bg-admin-subtle text-admin-muted rounded border px-2 py-0.5 font-sans text-[10px]">
                {eyebrow}
              </span>
            </div>
          ) : null}
          <h1 className="text-admin-fg font-sans text-xl font-bold tracking-tight text-balance">
            {title}
          </h1>
          {description ? <p className="text-admin-muted mt-0.5 text-xs">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function AdminEmptyState({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="border-admin-border bg-admin-canvas text-admin-muted rounded-md border p-8 text-center font-sans text-xs"
    >
      {message}
    </div>
  );
}

export function AdminErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="border-admin-danger-border bg-admin-danger-bg text-admin-danger rounded-md border p-4 font-sans text-xs"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="border-admin-border bg-admin-canvas text-admin-fg mt-2 rounded-md border px-3 py-1.5 font-semibold"
        >
          Tekrar dene
        </button>
      ) : null}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Yükleniyor" className="animate-pulse space-y-2 p-3.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-admin-subtle h-12 rounded-md" />
      ))}
      <span className="sr-only">Yükleniyor…</span>
    </div>
  );
}
