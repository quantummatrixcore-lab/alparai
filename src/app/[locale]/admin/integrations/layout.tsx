import { requireAdmin } from "@/lib/auth/session";
import type { ReactNode } from "react";

export default async function IntegrationsLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
