import { AdminContainer } from "@/components/admin/admin-design-kit";
import { Loader2 } from "lucide-react";

export default function FinanceLoading() {
  return (
    <AdminContainer shell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="text-brand-400 h-8 w-8 animate-spin" />
        <p className="text-fg-muted text-sm">Loading financial data...</p>
      </div>
    </AdminContainer>
  );
}
