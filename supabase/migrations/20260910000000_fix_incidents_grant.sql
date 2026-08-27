-- Fix missing table-level SELECT grant caused by overriding column-level grant
GRANT SELECT ON public.incidents TO anon, authenticated;

-- Create suggestion_comments table
CREATE TABLE public.suggestion_comments (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  comment_text text not null check (char_length(comment_text) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.suggestion_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Suggestion comments are viewable by everyone"
  ON public.suggestion_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create suggestion comments"
  ON public.suggestion_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id and auth.uid() is not null);

CREATE POLICY "Users can update their own comments"
  ON public.suggestion_comments FOR UPDATE
  USING (user_id = auth.uid() or public.is_moderator(auth.uid()));

CREATE POLICY "Users can delete their own comments"
  ON public.suggestion_comments FOR DELETE
  USING (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Index for fast lookup by suggestion_id
CREATE INDEX idx_suggestion_comments_suggestion_id ON public.suggestion_comments(suggestion_id);
CREATE INDEX idx_suggestion_comments_created_at ON public.suggestion_comments(created_at asc);

-- RPC for incrementing comment count
CREATE OR REPLACE FUNCTION public.increment_suggestion_comment_count(p_suggestion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.suggestions
  SET comments_count = comments_count + 1
  WHERE id = p_suggestion_id;
END;
$$;


-- ROLLBACK:
-- DROP TABLE IF EXISTS public.suggestion_comments CASCADE;
