"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Wallet, Bot, ShieldAlert, Coins, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin", color: "text-blue-400" },
    { name: "Finance", icon: Wallet, href: "/admin/finance", color: "text-emerald-400" },
    { name: "Autopilot", icon: Bot, href: "/admin/autopilot", color: "text-purple-400" },
    { name: "Security", icon: ShieldAlert, href: "/admin/security", color: "text-rose-400" },
    { name: "Grant", icon: Coins, href: "/admin/grant", color: "text-amber-400" },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-center border-b border-white/10">
        <h1 className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-2xl font-black text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
          ALPAR AI
        </h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_currentColor]",
                  item.color
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-center text-xs text-zinc-500">
        Powered by QuantumMatrix
      </div>
    </div>
  );
}
