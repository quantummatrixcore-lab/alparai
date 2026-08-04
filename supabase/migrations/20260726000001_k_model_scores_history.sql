-- K16: Model score history MAT view for time-series chart

create materialized view if not exists public.k_model_scores_history as
select
  ms.category_id,
  ms.model_id,
  ms.score,
  ms.wilson_lower,
  ms.wilson_upper,
  ms.sample_size,
  ms.last_audited_at as snapshot_at
from public.k_model_scores ms
where ms.last_audited_at is not null
order by ms.last_audited_at desc;

create unique index if not exists idx_k_history_unique on public.k_model_scores_history (category_id, model_id, snapshot_at);

-- ROLLBACK:
-- drop materialized view if exists public.k_model_scores_history;
