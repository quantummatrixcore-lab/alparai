-- Ensure no incidents have NULL published_at, so that sorting is consistent
UPDATE public.incidents
SET published_at = NOW() - interval '2 days'
WHERE published_at IS NULL;
