-- Migration: Cleanup fabricated mock MRR/revenue metrics data
-- Replaces mock $12k-$34k MRR values with 0/clean state

delete from public.finance_revenue_metrics;

-- ROLLBACK:
-- insert into public.finance_revenue_metrics (month, mrr_usd, arr_usd, active_subs) values
--   ('2026-02-01', 12000.00, 144000.00, 52),
--   ('2026-03-01', 15000.00, 180000.00, 68),
--   ('2026-04-01', 18000.00, 216000.00, 81),
--   ('2026-05-01', 22000.00, 264000.00, 95),
--   ('2026-06-01', 26000.00, 312000.00, 112),
--   ('2026-07-01', 34000.00, 408000.00, 142);
