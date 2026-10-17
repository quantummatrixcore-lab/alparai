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

// 2. Anthropic
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

// 2b. Claude (Official Terracotta Spark / Asterism)
export function ClaudeIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="Claude logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#d97757" fillOpacity="0.16" />
      <path
        d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"
        fill="#D97757"
      />
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

// 8. DeepSeek (Official Whale Logomark)
export function DeepSeekIcon({ size = "100%", className = "", ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label="DeepSeek logo"
      role="img"
      {...props}
    >
      <rect width="24" height="24" rx="5" fill="#1e6fff" fillOpacity="0.16" />
      <path
        d="M23.748 4.651c-.254-.124-.364.113-.512.233-.051.04-.094.09-.137.137-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.155-.708-.311-.955-.65-.172-.24-.219-.509-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.094.172.187.129.323-.082.28-.18.553-.266.833-.055.179-.137.218-.328.14a5.5 5.5 0 0 1-1.737-1.179c-.857-.828-1.631-1.743-2.597-2.46a12 12 0 0 0-.689-.47c-.985-.957.13-1.743.387-1.836.27-.098.094-.433-.778-.428-.872.003-1.67.295-2.687.685a3 3 0 0 1-.465.136 9.6 9.6 0 0 0-2.883-.101c-1.885.21-3.39 1.1-4.497 2.622C.082 8.776-.231 10.854.152 13.02c.403 2.284 1.568 4.175 3.36 5.653 1.857 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.132-.284 4.994-1.86.47.234.962.328 1.78.398.629.058 1.235-.031 1.705-.129.735-.155.684-.836.418-.961-2.155-1.004-1.682-.595-2.112-.926 1.095-1.295 2.768-3.598 3.284-6.733.05-.346.115-.834.108-1.114-.004-.171.035-.238.23-.257a4.2 4.2 0 0 0 1.545-.475c1.397-.763 1.96-2.016 2.093-3.517.02-.23-.004-.467-.247-.588M11.58 18.168c-2.088-1.642-3.101-2.183-3.52-2.16-.39.024-.32.472-.234.763.09.288.207.487.371.74.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.168-1.361-.801-2.5-1.86-3.301-3.306-.775-1.393-1.225-2.888-1.299-4.482-.02-.385.094-.522.477-.592a4.7 4.7 0 0 1 1.53-.038c2.131.311 3.946 1.264 5.467 2.774.868.86 1.525 1.887 2.202 2.89.72 1.066 1.494 2.082 2.48 2.915.348.291.626.513.892.677-.802.09-2.14.109-3.055-.615zm1.001-6.44a.306.306 0 0 1 .415-.287.3.3 0 0 1 .113.074.3.3 0 0 1 .086.214c0 .17-.136.307-.308.307a.303.303 0 0 1-.306-.307m3.11 1.596c-.2.081-.4.151-.591.16a1.25 1.25 0 0 1-.798-.254c-.274-.23-.47-.358-.551-.758a1.7 1.7 0 0 1 .015-.588c.07-.327-.007-.537-.238-.727-.188-.156-.426-.199-.689-.199a.6.6 0 0 1-.254-.078.253.253 0 0 1-.114-.358 1 1 0 0 1 .192-.21c.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.392.451.462.576.685.915.176.264.336.536.446.848.066.194-.02.353-.25.45"
        fill="#1E6FFF"
      />
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
  claude: ClaudeIcon,
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
  if (clean.includes("anthropic")) return "anthropic";
  if (clean.includes("claude")) return "claude";
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