"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function IncidentFilters({
  defaultCategory,
  defaultSeverity,
  defaultQ = "",
  defaultSort = "newest",
  basePath = "/incidents",
}: {
  defaultCategory?: string;
  defaultSeverity?: string;
  defaultQ?: string;
  defaultSort?: string;
  basePath?: string;
}) {
  const t = useTranslations("incident");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const [q, setQ] = useState(defaultQ);
  const [category, setCategory] = useState(defaultCategory ?? "");
  const [severity, setSeverity] = useState(defaultSeverity ?? "");
  const [sort, setSort] = useState(defaultSort);

  // Sync state if URL query parameters change (e.g. from popstate or back button)
  useEffect(() => {
    setQ(defaultQ);
  }, [defaultQ]);

  useEffect(() => {
    setSort(defaultSort);
  }, [defaultSort]);

  const submitHref = useMemo(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (severity) params.set("severity", severity);
    if (sort && sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }, [q, category, severity, sort, basePath]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{tCommon("filter")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search
            className="text-fg-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            name="q"
            placeholder={tCommon("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          id="sort-by-select"
          label={t("sort_by")}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: "newest", label: t("sort_newest") },
            { value: "votes", label: t("sort_votes") },
            { value: "views", label: t("sort_views") },
            { value: "truth_score", label: t("sort_truth_score") },
          ]}
        />
        <div className="grid grid-cols-2 gap-2">
          <CategoryPill
            label={tCommon("all")}
            value=""
            active={!category}
            onClick={() => setCategory("")}
          />
          {INCIDENT_CATEGORIES.map((c) => (
            <CategoryPill
              key={c.value}
              label={tCat(c.value)}
              value={c.value}
              active={category === c.value}
              onClick={() => setCategory(c.value)}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <SeverityChip
            label={tCommon("all")}
            value=""
            active={!severity}
            onClick={() => setSeverity("")}
          />
          {SEVERITY_LEVELS.map((s) => (
            <SeverityChip
              key={s.value}
              label={t(`severity_${s.value}`)}
              value={s.value}
              active={severity === s.value}
              onClick={() => setSeverity(s.value)}
            />
          ))}
        </div>
        <Link
          href={submitHref}
          className="bg-brand-500 hover:bg-brand-600 inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-semibold text-white"
        >
          {tCommon("search")}
        </Link>
      </CardContent>
    </Card>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  value?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-left text-xs font-medium transition-colors",
        active
          ? "border-brand-500 bg-brand-500/10 text-brand-300"
          : "border-border-subtle bg-bg-tertiary text-fg-muted hover:border-border-strong",
      )}
    >
      {label}
    </button>
  );
}

function SeverityChip({
  label,
  active,
  onClick,
}: {
  label: string;
  value?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium tracking-wider uppercase transition-colors",
        active ? "bg-brand-500 text-white" : "bg-bg-tertiary text-fg-muted hover:bg-bg-elevated",
      )}
    >
      {label}
    </button>
  );
}
