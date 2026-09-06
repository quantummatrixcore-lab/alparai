"use client";

import * as React from "react";
import {
  siSupabase,
  siVercel,
  siUpstash,
  siOpenrouter,
  siHuggingface,
  siGoogle,
  siSentry,
  siGithubactions,
  siPostgresql,
  siRedis,
  siStripe,
  siResend,
} from "simple-icons";

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  title?: string;
}

function createIconComponent(icon: { path: string; hex: string; title: string }) {
  return function BrandIcon({
    size = 20,
    color,
    title = icon.title,
    className,
    ...props
  }: BrandIconProps) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={color || `#${icon.hex}`}
        className={className}
        {...props}
      >
        <title>{title}</title>
        <path d={icon.path} />
      </svg>
    );
  };
}

export const SupabaseIcon = createIconComponent(siSupabase);
export const VercelIcon = createIconComponent(siVercel);
export const UpstashIcon = createIconComponent(siUpstash);
export const OpenRouterIcon = createIconComponent(siOpenrouter);
export const HuggingFaceIcon = createIconComponent(siHuggingface);
export const GoogleIcon = createIconComponent(siGoogle);
export const SentryIcon = createIconComponent(siSentry);
export const GitHubActionsIcon = createIconComponent(siGithubactions);
export const PostgresIcon = createIconComponent(siPostgresql);
export const RedisIcon = createIconComponent(siRedis);
export const StripeIcon = createIconComponent(siStripe);
export const ResendIcon = createIconComponent(siResend);
