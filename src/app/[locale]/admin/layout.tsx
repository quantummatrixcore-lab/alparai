import React from "react";
import { AdminSidebar } from "@/components/admin-core/admin-sidebar";
import { AdminTopbar } from "@/components/admin-core/admin-topbar";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "@/i18n/routing";

export const metadata = {
  title: "Alparai Admin",
  description: "Enterprise AI Governance, Threat Feed & Incident Intelligence Platform",
};

export default async function AdminV2Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}) {
  const resolvedParams = params ? await params : {};
  const locale = resolvedParams?.locale || "en";
  const user = await getCurrentUser();

  if (!user) {
    redirect({ href: "/auth/signin?returnTo=/admin", locale });
    return null;
  }

  const userRole = user.role;
  if (userRole !== "admin" && userRole !== "ceo" && userRole !== "moderator") {
    redirect({ href: "/", locale });
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-x-clip bg-[#ffffff] font-sans text-[#1f2328] antialiased selection:bg-[#0969da]/20 dark:bg-[#0d1117] dark:text-[#f0f6fc] dark:selection:bg-[#58a6ff]/20">
      {/* 5-Cluster Rigid Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        <AdminTopbar />
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
