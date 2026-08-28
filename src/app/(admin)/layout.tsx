import React from "react";
import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Command Center · ALPAR AI",
  description:
    "Real-time AI Trust Infrastructure Monitor, Operations and Autonomous Incident Governance Platform.",
  alternates: {
    canonical: "/admin",
  },
  openGraph: {
    title: "Admin Command Center · ALPAR AI",
    description:
      "Real-time AI Trust Infrastructure Monitor, Operations and Autonomous Incident Governance Platform.",
    url: "/admin",
    siteName: "ALPAR AI",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a] font-sans text-slate-100">
      {/* Corporate SEO Schema.org JSON-LD Structured Data */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <SoftwareApplicationJsonLd />

      {/* Background Neon Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[120px]" />
      </div>
      
      {/* Sidebar */}
      <div className="z-10 h-full">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="z-10 flex-1 overflow-y-auto p-8 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

