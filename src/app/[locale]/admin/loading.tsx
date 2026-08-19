import { AdminContainer } from "@/components/admin/admin-design-kit";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <AdminContainer shell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="text-sm text-fg-muted">Loading dashboard...</p>
      </div>
    </AdminContainer>
  );
}
