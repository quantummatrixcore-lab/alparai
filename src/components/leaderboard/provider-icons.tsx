"use client";

import React from "react";

export interface ProviderIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

// 1. OpenAI (ChatGPT)
export function OpenAIIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="OpenAI logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#10a37f" fillOpacity="0.16" />
      <path
        d="M20.5 10.3a5.2 5.2 0 0 0-.46-4.39 5.29 5.29 0 0 0-5.32-2.58 5.26 5.26 0 0 0-4.08-1.83 5.34 5.34 0 0 0-5.07 3.68 5.27 5.27 0 0 0-3.39 2.45 5.3 5.3 0 0 0 .61 5.86 5.22 5.22 0 0 0 .46 4.39 5.29 5.29 0 0 0 5.32 2.58 5.24 5.24 0 0 0 4.08 1.83 5.34 5.34 0 0 0 5.07-3.68 5.27 5.27 0 0 0 3.39-2.45 5.3 5.3 0 0 0-.61-5.86ZM12 21.5a3.81 3.81 0 0 1-2.47-.9l.17-.1 4.1-2.37a.78.78 0 0 0 .39-.67v-5.78l1.73 1a.06.06 0 0 1 .04.05v4.75a3.84 3.84 0 0 1-3.96 4.02Zm-7.7-4.45a3.78 3.78 0 0 1-.46-2.6 3.87 3.87 0 0 1 1.7-2.37l.17.1 4.1 2.37a.77.77 0 0 0 .78 0l5-2.89v2a.07.07 0 0 1-.03.06l-4.12 2.38a3.84 3.84 0 0 1-5.64-1.04l-1.5-2.01Zm-1.12-8.5a3.79 3.79 0 0 1 2-1.7 3.87 3.87 0 0 1 2.87.1l-.17.1-4.1 2.37a.78.78 0 0 0-.39.67v5.78l-1.73-1a.06.06 0 0 1-.04-.05V9.45a3.8 3.8 0 0 1 1.56-.9ZM12 2.5a3.81 3.81 0 0 1 2.47.9l-.17.1-4.1 2.37a.78.78 0 0 0-.39.67v5.78l-1.73-1a.06.06 0 0 1-.04-.05V6.52A3.84 3.84 0 0 1 12 2.5Zm7.7 4.45a3.78 3.78 0 0 1 .46 2.6 3.87 3.87 0 0 1-1.7 2.37l-.17-.1-4.1-2.37a.77.77 0 0 0-.78 0l-5 2.89v-2a.07.07 0 0 1 .03-.06l4.12-2.38a3.84 3.84 0 0 1 5.64 1.04l1.5 2.01Zm1.12 8.5a3.79 3.79 0 0 1-2 1.7 3.87 3.87 0 0 1-2.87-.1l.17-.1 4.1-2.37a.78.78 0 0 0 .39-.67v-5.78l1.73 1a.06.06 0 0 1 .04.05v4.75a3.8 3.8 0 0 1-1.56.9ZM9.5 13.5l2.5-1.44 2.5 1.44v2.89L12 17.83l-2.5-1.44V13.5Z"
        fill="#10a37f"
      />
    </svg>
  );
}

// 2. Anthropic (Claude)
export function AnthropicIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Anthropic logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#d97757" fillOpacity="0.16" />
      <path
        d="M13.8 4.5h2.9l4.8 15h-3.1l-1-3.2h-5.2l-1 3.2H8.1l5.7-15Zm2.7 9.4-1.8-5.7-1.8 5.7h3.6Z"
        fill="#d97757"
      />
      <path d="M5.5 4.5h3.1L3.8 19.5H0.7l4.8-15Z" fill="#d97757" fillOpacity="0.8" />
    </svg>
  );
}

// 3. Google DeepMind & Google Gemini
export function GoogleIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Google logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#4285f4" fillOpacity="0.12" />
      <path
        d="M20.64 12.2c0-.7-.06-1.38-.18-2.03H12v3.85h4.85a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.67-3.88 2.67-6.79Z"
        fill="#4285F4"
      />
      <path
        d="M12 21c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H3.96v2.33A8.99 8.99 0 0 0 12 21Z"
        fill="#34A853"
      />
      <path
        d="M6.97 13.71a5.4 5.4 0 0 1 0-3.42V7.96H3.96a9 9 0 0 0 0 8.08l3.01-2.33Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C16.46 3.86 14.43 3 12 3a8.99 8.99 0 0 0-8.04 4.96l3.01 2.33c.71-2.13 2.69-3.71 5.03-3.71Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GeminiIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Google Gemini logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#1e2238" />
      <defs>
        <linearGradient id="geminiGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
        fill="url(#geminiGradReact)"
      />
    </svg>
  );
}

export function DeepMindIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Google DeepMind logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#0053ff" fillOpacity="0.15" />
      <path
        d="M12 3.5 19.5 8v8L12 20.5 4.5 16V8L12 3.5Z"
        stroke="#0066FF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 3.5v17M4.5 8l15 8M19.5 8l-15 8"
        stroke="#00D2FF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="#0066FF" />
    </svg>
  );
}

// 4. Meta (Llama)
export function MetaIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Meta logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#0081fb" fillOpacity="0.12" />
      <path
        d="M16.7 5.5c-1.8 0-3.3 1-4.7 2.9C10.6 6.5 9.1 5.5 7.3 5.5 4.1 5.5 2 8 2 11.5c0 4.1 2.9 7 5.3 7 1.8 0 3.3-1.1 4.7-3.1 1.4 2 2.9 3.1 4.7 3.1 2.4 0 5.3-2.9 5.3-7 0-3.5-2.1-6-5.3-6Zm-9.4 10.8c-1.5 0-3-1.8-3-4.8 0-2.4 1.1-4.2 3-4.2 1.3 0 2.5.9 3.6 2.6-1.4 2.2-2.4 6.4-3.6 6.4Zm9.4 0c-1.2 0-2.2-4.2-3.6-6.4 1.1-1.7 2.3-2.6 3.6-2.6 1.9 0 3 1.8 3 4.2 0 3-1.5 4.8-3 4.8Z"
        fill="#0081FB"
      />
    </svg>
  );
}

// 5. xAI (Grok)
export function XAIIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="xAI Grok logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#111827" />
      <path
        d="M18.244 3.25h3.298l-7.206 8.236 8.477 11.206h-6.637l-5.198-6.797-5.949 6.797H1.728l7.708-8.811L1.25 3.25h6.805l4.697 6.21 5.492-6.21Zm-1.157 17.68h1.828L6.87 5.122H4.908l12.18 15.808Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 6. Mistral AI
export function MistralIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Mistral AI logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#fa520f" fillOpacity="0.12" />
      <rect x="3.5" y="5" width="3.4" height="3.4" rx="0.8" fill="#FA520F" />
      <rect x="17.1" y="5" width="3.4" height="3.4" rx="0.8" fill="#FA520F" />
      <rect x="3.5" y="10.3" width="3.4" height="3.4" rx="0.8" fill="#FA520F" />
      <rect x="8.0" y="10.3" width="8" height="3.4" rx="0.8" fill="#FA520F" />
      <rect x="17.1" y="10.3" width="3.4" height="3.4" rx="0.8" fill="#FA520F" />
      <rect x="3.5" y="15.6" width="17" height="3.4" rx="0.8" fill="#FA520F" />
    </svg>
  );
}

// 7. Cohere
export function CohereIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Cohere logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#39594c" fillOpacity="0.15" />
      <circle cx="8" cy="14" r="4.5" fill="#FF7759" />
      <circle cx="15" cy="9" r="4.5" fill="#39594C" />
      <circle cx="16" cy="15" r="3.5" fill="#D45B47" fillOpacity="0.9" />
    </svg>
  );
}

// 8. DeepSeek
export function DeepSeekIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="DeepSeek logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#0066ff" fillOpacity="0.15" />
      <path
        d="M4.5 14.5c2.5-4.5 6-7.5 11-7 2 .2 4 1.5 5 3.5-2-.5-4 0-5.5 1.5-1.8 1.8-1.5 4.5.5 6-3 .5-6-1-7.5-2.5l-3.5 1.5c1-1.5 1-2.2 0-3Z"
        fill="#1E6FFF"
      />
      <circle cx="17.5" cy="9.5" r="1" fill="#FFFFFF" />
    </svg>
  );
}

// 9. Perplexity
export function PerplexityIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Perplexity logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#20b2aa" fillOpacity="0.15" />
      <path
        d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"
        stroke="#20B2AA"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="8" y="8" width="8" height="8" rx="2" stroke="#20B2AA" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

// 10. Qwen / Alibaba Cloud
export function QwenIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Qwen logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#615ced" fillOpacity="0.15" />
      <path
        d="M12 4a8 8 0 1 0 5.66 13.66l2.34 2.34-1.42 1.42-2.34-2.34A8 8 0 0 0 12 4Zm0 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
        fill="#615CED"
      />
      <circle cx="12" cy="12" r="2.5" fill="#FF6A00" />
    </svg>
  );
}

// 11. Microsoft
export function MicrosoftIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Microsoft logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#00a4ef" fillOpacity="0.12" />
      <rect x="4" y="4" width="7.2" height="7.2" fill="#F25022" rx="1" />
      <rect x="12.8" y="4" width="7.2" height="7.2" fill="#7FBA00" rx="1" />
      <rect x="4" y="12.8" width="7.2" height="7.2" fill="#00A4EF" rx="1" />
      <rect x="12.8" y="12.8" width="7.2" height="7.2" fill="#FFB900" rx="1" />
    </svg>
  );
}

// 12. Apple
export function AppleIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Apple logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#ffffff" fillOpacity="0.1" />
      <path
        d="M15.5 3c-.1 1.2-.6 2.3-1.4 3-.8.7-1.9 1.1-2.9 1 .1-1.2.6-2.3 1.4-3 .8-.7 2-1.1 2.9-1ZM18.7 17.5c-.7 1-1.4 2-2.5 2s-1.4-.7-2.7-.7c-1.3 0-1.7.7-2.7.7s-1.8-1-2.5-2c-1.5-2.2-2.6-6.1-1-8.9.8-1.4 2.2-2.3 3.7-2.3 1.2 0 2.2.8 2.9.8.7 0 1.9-.8 3.2-.8 1.4 0 2.5.7 3.2 1.8-2.8 1.5-2.3 5.4.4 6.7-.6 1.4-1.3 2.7-2 3.7Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 13. Amazon AWS
export function AmazonIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Amazon logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#ff9900" fillOpacity="0.15" />
      <path
        d="M17.5 15.5c-4 2.8-9 2.5-12.5.3-.2-.1-.2-.4 0-.5 2.5-1 6-1.5 9-.8.9.2 2.5.7 3.5 1Z"
        stroke="#FF9900"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M18.8 15.2c.2.4.4 1 .2 1.4-.3.4-1 .3-1.4.1l1.2-1.5Z" fill="#FF9900" />
      <circle cx="12" cy="9.5" r="4" stroke="#FF9900" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

// 14. Nvidia
export function NvidiaIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Nvidia logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#76b900" fillOpacity="0.15" />
      <path
        d="M12 5.5c-4.2 0-7.8 2.8-9 6.5 1.2 3.7 4.8 6.5 9 6.5s7.8-2.8 9-6.5c-1.2-3.7-4.8-6.5-9-6.5Zm0 10.5c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z"
        fill="#76B900"
      />
      <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
    </svg>
  );
}

// 15. Hugging Face
export function HuggingFaceIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Hugging Face logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#ffd21e" fillOpacity="0.18" />
      <circle cx="12" cy="12" r="8" fill="#FFD21E" />
      <ellipse cx="8.5" cy="11" rx="1" ry="1.5" fill="#111827" />
      <ellipse cx="15.5" cy="11" rx="1" ry="1.5" fill="#111827" />
      <path
        d="M9 14.5c1 1.2 5 1.2 6 0"
        stroke="#111827"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 14c1 1 2 2 4 1M20 14c-1 1-2 2-4 1"
        stroke="#FF9800"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 16. Midjourney
export function MidjourneyIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Midjourney logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#1e293b" />
      <path
        d="M12 3 5 16l7 5 7-5L12 3Zm0 3.5L16.5 15 12 18.2 7.5 15 12 6.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 17. Stability AI
export function StabilityIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Stability AI logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#7c3aed" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="3.5" fill="#7C3AED" />
      <circle cx="12" cy="5.5" r="2" fill="#A855F7" />
      <circle cx="12" cy="18.5" r="2" fill="#A855F7" />
      <circle cx="5.5" cy="12" r="2" fill="#A855F7" />
      <circle cx="18.5" cy="12" r="2" fill="#A855F7" />
    </svg>
  );
}

// 18. ElevenLabs
export function ElevenLabsIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="ElevenLabs logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#ffffff" fillOpacity="0.1" />
      <rect x="8.5" y="5" width="2.5" height="14" rx="1.2" fill="#FFFFFF" />
      <rect x="13" y="5" width="2.5" height="14" rx="1.2" fill="#FFFFFF" />
    </svg>
  );
}

// 19. Groq
export function GroqIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Groq logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#f55036" fillOpacity="0.15" />
      <path d="M12 4a8 8 0 1 0 8 8h-4a4 4 0 1 1-4-4V4Z" fill="#F55036" />
      <circle cx="16" cy="8" r="2" fill="#F55036" />
    </svg>
  );
}

// 20. Suno AI
export function SunoIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Suno logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#ff4f00" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="7.5" fill="#FF4F00" />
      <path
        d="M8 12c1-3 3-4 4-1s3 2 4-1"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// 21. Scale AI
export function ScaleIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Scale AI logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#5046e5" fillOpacity="0.15" />
      <path
        d="M12 3.5 19 7.5v9l-7 4-7-4v-9l7-4Z"
        stroke="#5046E5"
        strokeWidth="1.6"
        fill="none"
      />
      <path
        d="M12 3.5v17M5 7.5l7 4.5 7-4.5"
        stroke="#5046E5"
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}

// 22. Runway
export function RunwayIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Runway logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#18181b" />
      <path
        d="M7 5h6a4 4 0 0 1 3.5 6 4 4 0 0 1-2.5 1.8L17.5 19h-3.2l-3-5.5H9.5V19H7V5Zm2.5 2.5v4h3.5a2 2 0 1 0 0-4H9.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 23. Cognition (Devin)
export function CognitionIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Cognition logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#10b981" fillOpacity="0.15" />
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="#10B981" strokeWidth="1.8" fill="none" />
      <path
        d="M7.5 10.5 10 13l-2.5 2.5M12.5 15.5H16.5"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 24. Leonardo.ai
export function LeonardoIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Leonardo AI logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#8b5cf6" fillOpacity="0.15" />
      <path
        d="M5 16 6.5 7l4 4.5L12 5l1.5 6.5 4-4.5L19 16H5Zm0 1.5h14v1.5H5v-1.5Z"
        fill="#8B5CF6"
      />
    </svg>
  );
}

// 25. Together AI
export function TogetherIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-label="Together AI logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#0a84ff" fillOpacity="0.15" />
      <circle cx="8" cy="8" r="3" fill="#0A84FF" />
      <circle cx="16" cy="8" r="3" fill="#5E5CE6" />
      <circle cx="12" cy="15" r="3" fill="#30D158" />
      <path d="M8 8l8 0M8 8l4 7M16 8l-4 7" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.2" />
    </svg>
  );
}

// Map of canonical provider slug to component
export const PROVIDER_ICON_MAP: Record<string, React.ComponentType<ProviderIconProps>> = {
  openai: OpenAIIcon,
  chatgpt: OpenAIIcon,
  anthropic: AnthropicIcon,
  claude: AnthropicIcon,
  google: GoogleIcon,
  gemini: GeminiIcon,
  deepmind: DeepMindIcon,
  meta: MetaIcon,
  llama: MetaIcon,
  xai: XAIIcon,
  grok: XAIIcon,
  mistral: MistralIcon,
  cohere: CohereIcon,
  deepseek: DeepSeekIcon,
  perplexity: PerplexityIcon,
  qwen: QwenIcon,
  alibaba: QwenIcon,
  microsoft: MicrosoftIcon,
  copilot: MicrosoftIcon,
  apple: AppleIcon,
  amazon: AmazonIcon,
  aws: AmazonIcon,
  nvidia: NvidiaIcon,
  huggingface: HuggingFaceIcon,
  midjourney: MidjourneyIcon,
  stability: StabilityIcon,
  elevenlabs: ElevenLabsIcon,
  groq: GroqIcon,
  suno: SunoIcon,
  scale: ScaleIcon,
  runway: RunwayIcon,
  cognition: CognitionIcon,
  devin: CognitionIcon,
  leonardo: LeonardoIcon,
  together: TogetherIcon,
};

/**
 * Normalizes provider name or slug to canonical key
 */
export function normalizeProviderKey(input?: string | null): string | null {
  if (!input) return null;
  const clean = input
    .toLowerCase()
    .trim()
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim();

  if (clean.includes("openai") || clean.includes("chatgpt") || clean.includes("gpt-")) return "openai";
  if (clean.includes("anthropic") || clean.includes("claude")) return "anthropic";
  if (clean.includes("deepmind")) return "deepmind";
  if (clean.includes("gemini")) return "gemini";
  if (clean.includes("google")) return "google";
  if (clean.includes("meta") || clean.includes("llama")) return "meta";
  if (clean.includes("xai") || clean.includes("grok") || clean === "x") return "xai";
  if (clean.includes("mistral") || clean.includes("codestral") || clean.includes("pixtral")) return "mistral";
  if (clean.includes("cohere")) return "cohere";
  if (clean.includes("deepseek")) return "deepseek";
  if (clean.includes("perplexity")) return "perplexity";
  if (clean.includes("qwen") || clean.includes("alibaba")) return "qwen";
  if (clean.includes("microsoft") || clean.includes("copilot") || clean.includes("phi-")) return "microsoft";
  if (clean.includes("apple")) return "apple";
  if (clean.includes("amazon") || clean.includes("aws") || clean.includes("bedrock") || clean.includes("titan")) return "amazon";
  if (clean.includes("nvidia") || clean.includes("nemotron")) return "nvidia";
  if (clean.includes("hugging") || clean === "hf") return "huggingface";
  if (clean.includes("midjourney")) return "midjourney";
  if (clean.includes("stability") || clean.includes("stable diffusion")) return "stability";
  if (clean.includes("eleven")) return "elevenlabs";
  if (clean.includes("groq")) return "groq";
  if (clean.includes("suno")) return "suno";
  if (clean.includes("scale")) return "scale";
  if (clean.includes("runway")) return "runway";
  if (clean.includes("cognition") || clean.includes("devin")) return "cognition";
  if (clean.includes("leonardo")) return "leonardo";
  if (clean.includes("together")) return "together";

  return null;
}

export function hasProviderIcon(nameOrSlug?: string | null): boolean {
  const key = normalizeProviderKey(nameOrSlug);
  return !!key && !!PROVIDER_ICON_MAP[key];
}

export function ProviderVectorIcon({
  nameOrSlug,
  size = "100%",
  className = "",
  ...props
}: ProviderIconProps & { nameOrSlug?: string | null }) {
  const key = normalizeProviderKey(nameOrSlug);
  if (!key) return null;
  const Component = PROVIDER_ICON_MAP[key];
  if (!Component) return null;
  return <Component size={size} className={className} {...props} />;
}

export function getProviderIconComponent(nameOrSlug?: string | null): React.ComponentType<ProviderIconProps> | null {
  const key = normalizeProviderKey(nameOrSlug);
  if (!key) return null;
  return PROVIDER_ICON_MAP[key] || null;
}