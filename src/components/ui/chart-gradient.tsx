import { CHART_COLORS } from "@/lib/utils/chart-colors";

interface GradientDefProps {
  id?: string;
  from?: string;
  to?: string;
}

export function AreaGradient({
  id = "areaBrand",
  from = CHART_COLORS.brand.primary,
  to = "#000",
}: GradientDefProps) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={from} stopOpacity={0.3} />
      <stop offset="95%" stopColor={to} stopOpacity={0} />
    </linearGradient>
  );
}
