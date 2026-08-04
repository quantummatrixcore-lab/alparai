"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ShieldCheck, Zap, Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/logo";

export function AdminContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
}

export function AdminPageHeader({
  icon,
  title,
  subtitle,
  action,
  badge,
  breadcrumb,
  lastUpdated,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumb?: { label: string; href: string }[];
  lastUpdated?: string;
  className?: string;
}) {
  const t = useTranslations("admin");

  return (
    <header
      className={cn(
        "from-bg-secondary via-bg-tertiary to-bg-elevated relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r p-6 shadow-2xl backdrop-blur-xl",
        className,
      )}
    >
      <div className="bg-brand-500/10 absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full blur-3xl" />
      <div className="bg-accent-500/10 absolute bottom-0 left-1/3 -mb-10 h-40 w-40 rounded-full blur-3xl" />

      {/* Breadcrumb Navigation */}
      {breadcrumb && (
        <nav className="text-fg-muted relative z-10 mb-2 flex items-center gap-1.5 text-xs">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className="hover:text-fg-primary font-medium transition-colors"
              >
                {item.label}
              </Link>
              {index < breadcrumb.length - 1 && <span className="text-white/20">/</span>}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="border-brand-500/30 bg-brand-500/10 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            {icon ?? <Logo className="text-brand-400 h-7 w-7" />}
          </div>

          <div>
            <h1 className="text-fg-primary inline-flex items-center gap-3 text-2xl font-extrabold tracking-tight">
              <span>{title}</span>
              {badge ? (
                <span className="shrink-0">{badge}</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Protected
                </span>
              )}
            </h1>
            {subtitle && <p className="text-fg-muted mt-1 text-xs font-medium">{subtitle}</p>}
            {lastUpdated && (
              <p className="text-fg-muted mt-1 font-mono text-[10px]">
                {t("last_updated")}: {lastUpdated}
              </p>
            )}
          </div>
        </div>

        {action && <div className="relative z-10 flex items-center gap-3">{action}</div>}
      </div>
    </header>
  );
}

export function AdminSectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "from-bg-secondary/90 to-bg-tertiary/90 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b p-6 shadow-xl backdrop-blur-xl transition duration-300 hover:border-white/20",
        className,
      )}
    >
      {title && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
              <Sparkles className="text-brand-400 h-4 w-4" />
              {title}
            </h3>
            {subtitle && <p className="text-fg-muted mt-0.5 text-xs">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  variant = "default",
  delta,
  sparkline,
  icon,
  href,
  tooltip,
  className,
}: {
  label: string;
  value: string | number;
  variant?: "default" | "success" | "warning" | "danger";
  delta?: { value: number; isPositive: boolean };
  sparkline?: number[];
  icon?: React.ReactNode;
  href?: string;
  tooltip?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const colorClasses = {
    default: "text-white",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-rose-400",
  };

  const borderGlow = {
    default: "border-brand-500/20 hover:border-brand-500/40 shadow-brand-500/5",
    success: "border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5",
    warning: "border-amber-500/20 hover:border-amber-500/40 shadow-amber-500/5",
    danger: "border-rose-500/20 hover:border-rose-500/40 shadow-rose-500/5",
  }[variant];

  const glowRgb = {
    default: "168,85,247",
    success: "39,174,96",
    warning: "243,156,18",
    danger: "230,57,70",
  }[variant];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-fg-muted text-[11px] font-bold tracking-wider uppercase"
            title={tooltip}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-2 font-mono text-3xl font-extrabold tracking-tight",
              colorClasses[variant],
            )}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/80 shadow-inner">
            {icon}
          </div>
        )}
      </div>

      {(delta || sparkline) && (
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold",
                delta.isPositive
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border border-rose-500/20 bg-rose-500/10 text-rose-400",
              )}
            >
              {delta.isPositive ? "+" : ""}
              {delta.value}%
            </span>
          )}

          {sparkline && sparkline.length > 1 && (
            <svg className="h-6 w-20 shrink-0" viewBox="0 0 100 30">
              <path
                d={`M ${sparkline.map((val, idx) => `${(idx / (sparkline.length - 1)) * 100} ${30 - val}`).join(" L ")}`}
                fill="none"
                stroke={delta ? (delta.isPositive ? "#10b981" : "#f43f5e") : "#c084fc"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      )}
    </>
  );

  const classes = cn(
    "from-bg-secondary/90 via-bg-tertiary/90 to-bg-elevated/90 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-xl backdrop-blur-xl transition-all duration-300",
    borderGlow,
    href ? "cursor-pointer hover:scale-[1.02]" : "",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {cardContent}
        <ArrowUpRight className="text-fg-muted absolute top-3 right-3 h-4 w-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={classes}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(${glowRgb},0.15), transparent 70%)`,
          }}
        />
      )}
      {cardContent}
    </div>
  );
}

export function ZeroCostBanner({
  services,
  totalSaved,
  locale,
}: {
  services: unknown;
  totalSaved: string;
  locale: string;
}) {
  void services;
  void locale;
  return (
    <div className="via-bg-secondary to-bg-tertiary relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Zero Token Cost Tier Active</h3>
            <p className="text-xs text-emerald-300">
              Free open-source & provider tier allocation active ({totalSaved} saved)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmptyStateIllustration({
  title,
  description,
  action,
  icon: IconProp,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType | React.ReactNode;
}) {
  const renderIcon = () => {
    if (!IconProp) return <Inbox className="h-8 w-8" />;
    if (
      typeof IconProp === "function" ||
      (typeof IconProp === "object" && IconProp !== null && "render" in IconProp)
    ) {
      const Comp = IconProp as React.ElementType;
      return <Comp className="h-8 w-8" />;
    }
    return IconProp;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-white/5 bg-black/20 p-8 text-center">
      <div className="text-fg-muted rounded-2xl border border-white/10 bg-white/5 p-4">
        {renderIcon()}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-fg-muted mt-1 max-w-sm text-xs">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
