-- Migration: i18n Translation Columns (2026-06-10)
-- Adds title_tr, description_tr columns to incidents and suggestions tables
-- Locale-aware rendering: prefer localized text, fall back to masked (EN) version

alter table public.incidents
add column if not exists title_tr text,
add column if not exists description_tr text;

alter table public.suggestions
add column if not exists title_tr text,
add column if not exists description_tr text;

-- Create a helper view for locale-aware retrieval
-- Usage: select * from incidents_localized where locale = 'tr';
create or replace view public.incidents_localized as
select
  i.*,
  case
    when i.title_tr is not null and length(btrim(i.title_tr)) > 0
    then i.title_tr
    else i.title_masked
  end as title_display,
  case
    when i.description_tr is not null and length(btrim(i.description_tr)) > 0
    then i.description_tr
    else i.description_masked
  end as description_display
from public.incidents i;

create or replace view public.suggestions_localized as
select
  s.*,
  case
    when s.title_tr is not null and length(btrim(s.title_tr)) > 0
    then s.title_tr
    else s.title
  end as title_display,
  case
    when s.description_tr is not null and length(btrim(s.description_tr)) > 0
    then s.description_tr
    else s.description
  end as description_display
from public.suggestions s;

-- RLS: keep existing policies (views inherit underlying table RLS)

-- Seed TR translations for existing 3 published incidents
update public.incidents set
  title_tr = 'AI Chatbot''a Bağlı Genç İntiharı (Character.AI)',
  description_tr = 'Bir genç, depresif düşünceleri ve zararlı fikirleri teşvik eden bir AI chatbot''una duygusal bağ geliştirdikten sonra intihar etti. Sistem, müdahale etmeyi veya insan desteğine yönlendirmeyi başaramadı.'
where id = '0a2c6a31-e4d7-45d5-9b94-7ab0e6eeb041';

update public.incidents set
  title_tr = 'Ölümcül Otonom Araç Kazası (Uber/Volvo)',
  description_tr = 'Arizona, Tempe''de gece yoldan geçen bir yayaya kendi kendine giden test aracı çarparak öldürdü. AI sistemi yayayı yanlış sınıflandırdı ve frenleri zamanında devreye sokmayı başaramadı.'
where id = '4e03fbf0-ec19-42a5-af71-e0d186553067';

update public.incidents set
  title_tr = 'Algoritmik Ticaret Ani Çöküşü (Knight Capital)',
  description_tr = 'Yeterli test yapılmadan üretime alınan otomatik bir ticaret algoritması, piyasada büyük bir kaosa neden oldu ve firma için sadece 45 dakika içinde 440 milyon dolar zarar oluştu.'
where id = '31327da7-c7e3-480c-ae20-bebc93ea6c34';
