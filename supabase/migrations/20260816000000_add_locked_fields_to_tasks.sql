ALTER TABLE automation_tasks 
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS locked_by VARCHAR(255);

-- FOR UPDATE SKIP LOCKED sorgularının hızlı çalışması için index
CREATE INDEX IF NOT EXISTS idx_automation_tasks_locked 
ON automation_tasks(status, locked_at) 
WHERE locked_at IS NULL;


-- ROLLBACK:
-- -- Add rollback statements here
