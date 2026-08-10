import { redirect } from "next/navigation";

export default function AiHubRedirect() {
  redirect("/admin/ai-hub/orchestrator");
}
