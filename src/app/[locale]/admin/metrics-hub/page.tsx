import { redirect } from "next/navigation";

export default function MetricsHubRedirect() {
  redirect("/admin/metrics-hub/slo-dashboard");
}
