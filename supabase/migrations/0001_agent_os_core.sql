-- M-01: SÜRÜ YÖNETİM MERKEZİ (Event Bus)

-- Tasks Tablosu
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    ttl TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Heartbeats Tablosu (M-05 Auto-Kill İçin)
CREATE TABLE IF NOT EXISTS public.heartbeats (
    agent_id UUID PRIMARY KEY,
    role VARCHAR(255) NOT NULL,
    last_active_ts TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Realtime yayını aç (Event-Driven mimari için şart)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;


-- M-08: FİNANS VE BÜTÇE (Budget Guard)

-- Cost Log Tablosu
CREATE TABLE IF NOT EXISTS public.cost_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    model_used VARCHAR(255) NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    cost_usd DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- System Flags Tablosu (Hard-Stop Devresi)
CREATE TABLE IF NOT EXISTS public.system_flags (
    key VARCHAR(255) PRIMARY KEY,
    value BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Default Hard-Stop flag'ini false olarak ekle
INSERT INTO public.system_flags (key, value) 
VALUES ('HARD_STOP_PAID_API', false)
ON CONFLICT (key) DO NOTHING;
