"use client";

import { Star, CheckCircle, XCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { IntegrationAlternative } from "@/lib/integrations/types";
import { LOGO_MAP } from "@/lib/integrations/logos";

interface AlternativeCardsProps {
  alternatives: IntegrationAlternative[];
}

function RatingStars({ rating }: { rating?: number | null }) {
  if (!rating || rating <= 0) {
    return <span className="text-fg-muted font-mono text-[10px] font-medium">Unrated (N/A)</span>;
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          weight={star <= rating ? "fill" : "regular"}
          className={cn("h-3 w-3", star <= rating ? "text-amber-400" : "text-zinc-600")}
        />
      ))}
    </div>
  );
}

function LogoBadge({ id, name }: { id: string; name: string }) {
  const Logo = LOGO_MAP[id];
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 p-2">
      {Logo ? (
        <Logo className="h-full w-full" />
      ) : (
        <span className="text-fg-muted text-xs font-bold">{name.slice(0, 2)}</span>
      )}
    </div>
  );
}

export function AlternativeCards({ alternatives }: AlternativeCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {alternatives.map((alt) => (
        <div
          key={alt.id}
          className="bg-bg-secondary/40 border-border-subtle group rounded-lg border p-3.5 transition-all duration-200 hover:border-white/10 hover:shadow-md"
        >
          <div className="mb-2.5 flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <LogoBadge id={alt.id} name={alt.name} />
              <div>
                <h5 className="text-fg-primary text-sm leading-tight font-bold">{alt.name}</h5>
                <RatingStars rating={alt.rating} />
              </div>
            </div>
          </div>

          <p className="text-fg-muted mb-3 line-clamp-2 text-xs leading-relaxed">
            {alt.description}
          </p>

          <div className="mb-2.5 space-y-1">
            {alt.pros.slice(0, 2).map((pro, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle weight="fill" className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                <span className="text-fg-secondary text-xs leading-tight">{pro}</span>
              </div>
            ))}
            {alt.cons.slice(0, 2).map((con, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <XCircle weight="fill" className="mt-0.5 h-3 w-3 shrink-0 text-rose-400" />
                <span className="text-fg-secondary text-xs leading-tight">{con}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] font-bold text-white/70">
              {alt.pricing}
            </span>
            {alt.website && (
              <a
                href={alt.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-brand-400 text-[11px] font-semibold transition-colors"
              >
                Visit →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
