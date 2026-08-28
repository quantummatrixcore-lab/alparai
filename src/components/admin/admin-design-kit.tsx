"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, Sparkles, ShieldCheck, Zap, Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/logo";
export { AdminSubNav, type AdminSubNavProps, type SubNavItem } from "./admin-sub-nav";

export function AdminContainer({
  children,
  className,
  shell = false,
}: {
  children: React.ReactNode;
  className?: string;
  shell?: boolean;
}) {
  if (shell) {
    return (
      <div
        className={cn(
          "bg-bg-primary text-fg-primary min-h-screen px-3 py-4 sm:px-6 sm:py-6 md:p-8",
          className,
        )}
      >
        <div className="bg-bg-secondary/40 ring-border-subtle mx-auto max-w-[1600px] space-y-8 rounded-3xl p-4 shadow-2xl ring-1 backdrop-blur-xl sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-[1600px] space-y-8 px-3 py-4 sm:px-6 md:p-8", className)}>
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
  subnav,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumb?: { label: string; href: string }[];
  lastUpdated?: string;
  subnav?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("admin");

  return (
    <header
      className={cn(
        "from-bg-secondary via-bg-tertiary to-bg-elevated border-border-subtle relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-gradient-to-r p-6 shadow-2xl backdrop-blur-xl",
        className,
      )}
    >
      <div className="bg-brand-500/10 absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full blur-3xl" />
      <div className="bg-accent-500/10 absolute bottom-0 left-1/3 -mb-10 h-40 w-40 rounded-full blur-3xl" />

      {subnav && <div className="relative z-10 mb-2 w-full">{subnav}</div>}

      {/* Breadcrumb Navigation */}
      {breadcrumb && (
        <nav className="text-fg-muted relative z-10 flex items-center gap-1.5 text-xs">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                className="hover:text-fg-primary font-medium transition-colors"
              >
                {item.label}
              </Link>
              {index < breadcrumb.length - 1 && <span className="text-fg-muted/50">/</span>}
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
            <h1 className="text-fg-primary text-2xl inline-flex items-center gap-3 font-extrabold tracking-tight">
              <span>{title}</span>
              {badge ? (
                <span className="shrink-0">{badge}</span>
              ) : (
                <span className="border-success-500/30 bg-success-500/10 text-success-400 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold">
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
        "from-bg-secondary/90 to-bg-tertiary/90 border-border-subtle hover:border-border-strong relative overflow-hidden rounded-2xl border bg-gradient-to-b p-6 shadow-xl backdrop-blur-xl transition duration-300",
        className,
      )}
    >
      {title && (
        <div className="border-border-subtle/50 mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
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
    success: "text-success-400",
    warning: "text-warning-400",
    danger: "text-danger-400",
  };

  const borderGlow = {
    default: "border-brand-500/20 hover:border-brand-500/40 shadow-brand-500/5",
    success: "border-success-500/20 hover:border-success-500/40 shadow-success-500/5",
    warning: "border-warning-500/20 hover:border-warning-500/40 shadow-warning-500/5",
    danger: "border-danger-500/20 hover:border-danger-500/40 shadow-danger-500/5",
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
          <div className="border-border-subtle text-fg-secondary rounded-xl border bg-white/5 p-2.5 shadow-inner">
            {icon}
          </div>
        )}
      </div>

      {(delta || sparkline) && (
        <div className="border-border-subtle/50 mt-4 flex items-center justify-between border-t pt-3">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold",
                delta.isPositive
                  ? "border-success-500/20 bg-success-500/10 text-success-400 border"
                  : "border-danger-500/20 bg-danger-500/10 text-danger-400 border",
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
    <div className="via-bg-secondary to-bg-tertiary border-success-500/30 relative overflow-hidden rounded-2xl border bg-gradient-to-r from-emerald-950/40 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="border-success-500/40 bg-success-500/20 text-success-400 rounded-xl border p-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Zero Token Cost Tier Active</h3>
            <p className="text-success-300 text-xs">
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
    <div className="border-border-subtle/50 bg-bg-primary/20 flex flex-col items-center justify-center space-y-4 rounded-2xl border p-8 text-center">
      <div className="text-fg-muted border-border-subtle rounded-2xl border bg-white/5 p-4">
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

