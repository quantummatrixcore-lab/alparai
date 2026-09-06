"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type ServiceStatus = "operational" | "degraded" | "down";

interface ServiceInfo {
  key: string;
  status: ServiceStatus;
}

export function StatusCards() {
  const t = useTranslations("status");
  const [services, setServices] = useState<ServiceInfo[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        const overall = data.status === "healthy" ? "operational" : "degraded";
        setServices([
          { key: "supabase", status: overall },
          { key: "upstash", status: overall },
          { key: "vercel", status: "operational" },
          { key: "sentry", status: "operational" },
        ]);
      })
      .catch(() => {
        setServices([
          { key: "supabase", status: "down" },
          { key: "upstash", status: "down" },
          { key: "vercel", status: "degraded" },
          { key: "sentry", status: "degraded" },
        ]);
      });
  }, []);

  const icon = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "down":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {services.map((svc) => (
        <Card key={svc.key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base capitalize">
              {icon(svc.status)}
              {svc.key}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-fg-muted text-sm">{t(`${svc.status}`)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
