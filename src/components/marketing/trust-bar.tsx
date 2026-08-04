import Link from "next/link";
import { useTranslations } from "next-intl";
import { Github, BookOpen, Shield, Ban } from "lucide-react";

export function TrustBar() {
  const t = useTranslations("trust");
  const items = [
    {
      icon: Github,
      label: t("open_source"),
      href: "https://github.com/quantummatrixcore-lab/alparai-platform",
    },
    { icon: BookOpen, label: t("methodology"), href: "/methodology" },
    { icon: Shield, label: t("neutrality"), href: "/legal/neutrality" },
    { icon: Ban, label: t("no_funding"), href: "/legal/neutrality" },
  ];
  return (
    <div className="animate-fade-up flex flex-wrap justify-center gap-6 border-y border-white/10 bg-white/5 px-8 py-4 opacity-0 backdrop-blur-md">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white/90"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
