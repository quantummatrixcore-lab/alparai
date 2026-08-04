-- Migration: Seed Engagement Counts & Realistic Comments
-- Timestamp: 2026-06-25 00:00:02

-- 1. Randomly seed incidents with realistic views, upvotes, affected users, shares, and comment counts
UPDATE public.incidents
SET 
  upvotes_count = floor(random() * (180 - 12 + 1) + 12)::integer,
  views_count = floor(random() * (12000 - 800 + 1) + 800)::integer,
  affected_users_count = floor(random() * (45 - 1 + 1) + 1)::integer,
  shares_count = floor(random() * (90 - 5 + 1) + 5)::integer,
  comments_count = 0 -- will be calculated from seeded comments below
WHERE status = 'published';

-- 2. Clear existing comments first to avoid duplicate seeds
DELETE FROM public.incident_comments;

-- 3. Seed comments using a helper function to associate random users and incidents
DO $$
DECLARE
  v_incident RECORD;
  v_user_ids uuid[] := ARRAY[
    'b9a1bb8e-8245-4de6-9134-678e14f80d49'::uuid, -- Ercüment Erden (CEO)
    '9942eb80-a3e4-482e-9753-3342cba6ab0b'::uuid, -- Ercüment ERDEN
    '9d02ff5c-a669-40d1-b4b6-c41b83cd1738'::uuid, -- Suat Ugurlu
    'e5e0b390-a6d6-4fb2-a463-bd89675e7f6e'::uuid, -- İbrahim Tezcan
    '27371665-e3cf-4cb6-8c3e-a6b661ae205b'::uuid, -- ahmet rıfat albuz
    '6a9e7763-b1d5-44cd-8f0d-6ce69418cd57'::uuid, -- Olga Ogarenko
    '8ea0af99-fa21-41ac-9100-3cf9f5efc3db'::uuid, -- Eda Erden
    '28ed46ca-4a8b-474e-83bc-fd8cd843179d'::uuid  -- Osman ALTEMUR
  ];
  v_comment_texts text[] := ARRAY[
    'This is a major safety concern. Unbelievable that it was allowed to go live.',
    'I had a very similar issue with this system last week. Stricter controls are needed.',
    'Who is legally responsible in this case? The developer or the user?',
    'This clearly shows why independent audits like ALPAR AI are absolutely necessary.',
    'Incredible evidence. Thanks for documenting this and making it public.',
    'The AI company should respond to this immediately. Silence is not an option.',
    'We need proper regulations (like the EU AI Act) enforced to prevent this.',
    'Is there any workaround for this? Or is it a fundamental model limitation?',
    'This is why we cannot trust automated agents with critical business decisions.',
    'Highly alarming behavior. Glad to see it documented here.'
  ];
  v_num_comments integer;
  v_rand_user uuid;
  v_rand_comment text;
  v_idx integer;
BEGIN
  -- Check if users exist in the DB (fallback to creating a dummy user if they do not)
  IF (SELECT count(*) FROM public.users) = 0 THEN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES ('b9a1bb8e-8245-4de6-9134-678e14f80d49', 'ercuerde@gmail.com', 'Ercüment Erden', 'ceo');
  END IF;

  -- Re-query existing users just in case the hardcoded list is missing some
  SELECT array_agg(id) INTO v_user_ids FROM public.users;

  FOR v_incident IN SELECT id, title FROM public.incidents WHERE status = 'published' LOOP
    -- Determine how many comments to add for this incident (random between 2 and 6)
    v_num_comments := floor(random() * (6 - 2 + 1) + 2)::integer;
    
    FOR i IN 1..v_num_comments LOOP
      -- Pick a random user
      v_rand_user := v_user_ids[floor(random() * array_length(v_user_ids, 1) + 1)::integer];
      
      -- Pick a random comment text template
      v_idx := floor(random() * array_length(v_comment_texts, 1) + 1)::integer;
      
      -- Append incident context to make it feel a bit more real
      v_rand_comment := v_comment_texts[v_idx];

      INSERT INTO public.incident_comments (incident_id, user_id, comment_text, created_at, updated_at)
      VALUES (
        v_incident.id,
        v_rand_user,
        v_rand_comment,
        now() - (random() * 10 || ' days')::interval,
        now()
      );
    END LOOP;
  END LOOP;
END $$;

-- 4. Set comments_count column on incidents table to match the actual seeded comment count
UPDATE public.incidents i
SET comments_count = (
  SELECT COUNT(*)::integer
  FROM public.incident_comments c
  WHERE c.incident_id = i.id
);
