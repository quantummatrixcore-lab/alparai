import { redirect } from "next/navigation";

export default function AnalyticsHubRedirect() {
  redirect("/admin/analytics-hub/analysis");
}
