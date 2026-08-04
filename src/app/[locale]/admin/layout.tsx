import * as React from "react";
import { setRequestLocale } from "next-intl/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

import { Manage360CommandPalette } from "@/components/admin/manage-360-palette";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "tr") {
    redirect("/en/admin");
  }
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/auth/signin?next=/${locale}/admin`);
  }
  const userRole = user.role as string;
  if (
    userRole !== "moderator" &&
    userRole !== "admin" &&
    userRole !== "ceo" &&
    userRole !== "advisor"
  ) {
    redirect(`/${locale}`);
  }

  const sidebarUser = {
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };

  return (
    <div className="bg-bg-primary text-fg-primary relative flex min-h-screen flex-col overflow-hidden lg:flex-row">
      {/* Premium Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.15),rgba(255,255,255,0))]" />
      <div className="pointer-events-none absolute top-[20%] -left-[20%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />

      <AdminSidebar user={sidebarUser} />
      <Manage360CommandPalette />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col pt-16 lg:h-screen lg:overflow-y-auto lg:pt-0">
        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  );
}
