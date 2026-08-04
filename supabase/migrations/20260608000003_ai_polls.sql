create table public.ai_polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null default 'dilemma',
  yes_count integer not null default 0,
  no_count integer not null default 0,
  unsure_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.ai_poll_votes (
  poll_id uuid not null references public.ai_polls(id) on delete cascade,
  user_id uuid, -- nullable for anonymous
  ip_hash text not null,
  choice text not null check (choice in ('yes', 'no', 'unsure')),
  created_at timestamptz not null default now(),
  primary key (poll_id, ip_hash)
);

-- Seed Dilemmas
insert into public.ai_polls (title, description) values
('Otonom Araç İkilemi', 'Otonom bir araç, yola aniden çıkan 5 yayayı ezmemek için direksiyonu kırıp içindeki 1 yolcuyu feda etmeli mi?'),
('Otonom Silah Sistemleri', 'Yapay zeka güdümlü silah sistemlerinin, insan onayı olmadan hedefe ateş etme (ölümcül karar) yetkisi olmalı mı?'),
('AGI Yönetimi', 'Yapay Genel Zeka (AGI) insanlıktan çok daha akıllı hale geldiğinde, politik ve ekonomik yönetim tamamen yapay zekaya devredilmeli mi?');
