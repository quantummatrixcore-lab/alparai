import * as React from "react";

type LogoProps = { className?: string };

export function LogoGitHub({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function LogoGitLab({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 23.1l4.4-13.5H7.6L12 23.1zm0-23.1L9.7 5.6 12 8.2l2.3-2.6L12 0zM2.2 9.6c-.8 0-1.2 1-.6 1.5L12 23.1 2.2 9.6zm19.6 0c.8 0 1.2 1 .6 1.5L12 23.1l9.8-13.5zM12 8.2L7.2 2.3 2.5 8.2H12zm0 0l4.8-5.9 4.7 5.9H12z" />
    </svg>
  );
}

export function LogoVercel({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 22.525H0l12-21.05 12 21.05z" />
    </svg>
  );
}

export function LogoSupabase({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.9 22.1c-.5 0-.9-.2-1.2-.6l-6.9-9c-.4-.5-.4-1.1-.1-1.6.3-.5.8-.8 1.4-.8h2.4L5.2 2.5c-.5-.9-.1-1.9.7-2.4.4-.2.8-.3 1.2-.3.5 0 .9.2 1.2.6l10.5 13.7c.4.5.4 1.1.1 1.6-.3.5-.8.8-1.4.8h-3.4l3.1 6.1c.2.4.2.8.1 1.2-.1.4-.3.7-.6.9-.4.2-.8.3-1.2.3z" />
    </svg>
  );
}

export function LogoUpstash({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function LogoCloudflare({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8.7 14.55c-.1-.25-.05-.45.05-.6.1-.15.3-.25.55-.3h5.3c.45 0 .85-.3.95-.75l.05-.2c.2-.8.3-1.25.2-1.7-.15-.8-.75-1.15-1.35-1.15H8.95c-.2 0-.35-.15-.35-.35s.15-.35.35-.35h5.65c1.05 0 2.05.45 2.4 1.7.15.55 0 1.15-.2 1.7-.15.4-.65.85-1.1.95l-.2.05c-.15.05-.25.15-.25.3s.1.25.25.3l.2.05c.7.15 1.2.55 1.4 1.1.2.55.1 1.15-.1 1.7h3.65c.25 0 .45.2.45.45 0 .25-.2.45-.45.45H5.25c-.25 0-.45-.2-.45-.45 0-.25.2-.45.45-.45h1.55c-.1-.35-.15-.7.05-1.05.15-.3.4-.55.75-.7z" />
    </svg>
  );
}

export function LogoSentry({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.48 2.2c-.7-1.1-1.9-1.8-3.2-1.9-.5-.02-1.03.05-1.5.2-.5.15-.95.4-1.32.72-.38.32-.68.7-.9 1.12-.1.2-.18.4-.25.62-.22.7-.2 1.45.05 2.1.7 1.6 2.2 2.6 3.9 2.8l.08.02v.1l7.1 12.3c.3.5.45 1.08.45 1.65 0 .58-.15 1.15-.45 1.65-.3.5-.78.88-1.3 1.1-.55.22-1.15.33-1.75.33h-.2c-.6 0-1.2-.1-1.75-.32-.55-.22-1.02-.6-1.32-1.1l-2.5-4.3v4.85c0 .3-.1.58-.3.8-.18.2-.44.33-.72.33h-1.8c-.28 0-.54-.13-.72-.34-.18-.2-.28-.5-.28-.8V9.8c-.8.3-1.6.8-2.2 1.5-.7.8-1.2 1.75-1.4 2.8-.2 1.05-.1 2.1.2 3.1l.08.1h-1.5c-.78 0-1.5-.42-1.93-1.07-.42-.65-.55-1.45-.37-2.2.38-1.7 1.4-3.2 2.8-4.2 1.4-1.02 3.1-1.55 4.8-1.5l1.72.03 2.2-3.8z" />
    </svg>
  );
}

export function LogoResend({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8.75 2.45c-.7-.2-1.6-.1-2.25.35-.85.6-1.2 1.5-1.05 2.45l1.75 12.7c.15 1.05.9 1.85 1.95 2.1l8.3 1.85c1.35.3 2.7-.55 3-1.95.05-.2.1-.4.1-.6 0-.8-.35-1.55-.95-2.1L9.8 5.25c-.45-.45-1-.75-1.55-.95l.5-1.85z" />
    </svg>
  );
}

export function LogoStripe({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-9c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
    </svg>
  );
}

export function LogoGoogle({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LogoFingerprintJS({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-6c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
    </svg>
  );
}

export function LogoPlaywright({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
    </svg>
  );
}

export function LogoHusky({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function LogoNeon({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.9 22.1c-.5 0-.9-.2-1.2-.6l-6.9-9c-.4-.5-.4-1.1-.1-1.6.3-.5.8-.8 1.4-.8h2.4L5.2 2.5c-.5-.9-.1-1.9.7-2.4.4-.2.8-.3 1.2-.3.5 0 .9.2 1.2.6l10.5 13.7c.4.5.4 1.1.1 1.6-.3.5-.8.8-1.4.8h-3.4l3.1 6.1c.2.4.2.8.1 1.2-.1.4-.3.7-.6.9-.4.2-.8.3-1.2.3z" />
    </svg>
  );
}

export function LogoRedis({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}

export function LogoVault({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  );
}

export function LogoOpenAI({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.2 12.2c0-1-.3-2-.8-2.8l1.3-.7c.6-.4.9-1.1.9-1.8 0-.9-.5-1.7-1.3-2.1L19.4 3.7c-.8-.5-1.8-.4-2.5.2l-1.2.9c-.8-.5-1.7-.8-2.7-.9V2.4c0-.9-.7-1.6-1.6-1.6s-1.6.7-1.6 1.6v1.5c-1 .1-1.9.4-2.7.9l-1.2-.9c-.7-.6-1.7-.7-2.5-.2L1.5 4.8c-.8.4-1.3 1.2-1.3 2.1 0 .7.3 1.4.9 1.8l1.3.7c-.5.8-.8 1.8-.8 2.8s.3 2 .8 2.8l-1.3.7c-.6.4-.9 1.1-.9 1.8 0 .9.5 1.7 1.3 2.1l1.9 1.1c.8.5 1.8.4 2.5-.2l1.2-.9c.8.5 1.7.8 2.7.9v1.5c0 .9.7 1.6 1.6 1.6s1.6-.7 1.6-1.6v-1.5c1-.1 1.9-.4 2.7-.9l1.2.9c.7.6 1.7.7 2.5.2l1.9-1.1c.8-.4 1.3-1.2 1.3-2.1 0-.7-.3-1.4-.9-1.8l-1.3-.7c.5-.8.8-1.8.8-2.8zm-9.2-5c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z" />
    </svg>
  );
}

export function LogoAnthropic({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2L2 22h4.5l2.2-5h6.6l2.2 5H22L12 2zm2.2 11H9.8L12 7.7 14.2 13z" />
    </svg>
  );
}

export function LogoOpenRouter({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2L2 9.5 5 22h14l3-12.5L12 2zm0 4.2l6.2 4.8-1.9 7.8H7.7l-1.9-7.8L12 6.2z" />
    </svg>
  );
}

export function LogoNvidia({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm3-6c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
    </svg>
  );
}

export function LogoTavily({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

export const LOGO_MAP: Record<string, React.ComponentType<LogoProps>> = {
  github: LogoGitHub,
  "github-actions": LogoGitHub,
  gitlab: LogoGitLab,
  bitbucket: LogoVercel,
  gitea: LogoGitHub,
  vercel: LogoVercel,
  "vercel-analytics": LogoVercel,
  netlify: LogoVercel,
  "cloudflare-pages": LogoCloudflare,
  railway: LogoVercel,
  supabase: LogoSupabase,
  neon: LogoNeon,
  turso: LogoSupabase,
  planetscale: LogoVercel,
  upstash: LogoUpstash,
  "redis-cloud": LogoRedis,
  dragonfly: LogoRedis,
  keydb: LogoRedis,
  cloudflare: LogoCloudflare,
  recaptcha: LogoGoogle,
  hcaptcha: LogoCloudflare,
  "friendly-captcha": LogoCloudflare,
  sentry: LogoSentry,
  datadog: LogoVercel,
  "grafana-faro": LogoVercel,
  highlight: LogoVercel,
  resend: LogoResend,
  sendgrid: LogoResend,
  mailgun: LogoResend,
  postmark: LogoResend,
  stripe: LogoStripe,
  paddle: LogoStripe,
  "lemon-squeezy": LogoStripe,
  chargebee: LogoStripe,
  "gitlab-ci": LogoGitLab,
  circleci: LogoVercel,
  jenkins: LogoHusky,
  playwright: LogoPlaywright,
  cypress: LogoPlaywright,
  selenium: LogoPlaywright,
  puppeteer: LogoPlaywright,
  husky: LogoHusky,
  lefthook: LogoHusky,
  "pre-commit": LogoHusky,
  "google-oauth": LogoGoogle,
  "github-oauth": LogoGitHub,
  auth0: LogoVercel,
  clerk: LogoVercel,
  plausible: LogoVercel,
  umami: LogoVercel,
  fathom: LogoVercel,
  fingerprintjs: LogoFingerprintJS,
  "fingerprint-pro": LogoFingerprintJS,
  incognia: LogoFingerprintJS,
  vault: LogoVault,
  "hashicorp-vault": LogoVault,
  doppler: LogoVault,
  "op-cli": LogoVault,
  onepassword: LogoVault,
  openrouter: LogoOpenRouter,
  openai: LogoOpenAI,
  anthropic: LogoAnthropic,
  gemini: LogoGoogle,
  nvidia: LogoNvidia,
  tavily: LogoTavily,
};
