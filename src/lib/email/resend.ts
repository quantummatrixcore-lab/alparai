let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import "server-only";
import { Resend } from "resend";


let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!(vault.read('RESEND_API_KEY') ?? process.env.RESEND_API_KEY)) return null;
  if (!resendClient) {
    resendClient = new Resend((vault.read('RESEND_API_KEY') ?? process.env.RESEND_API_KEY));
  }
  return resendClient;
}
