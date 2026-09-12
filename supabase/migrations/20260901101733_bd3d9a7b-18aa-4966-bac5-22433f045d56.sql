CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  cover_url TEXT,
  open_library_key TEXT,
  published_year INT,
  description TEXT,
  subjects TEXT[],
  match_source TEXT,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX books_identity_idx
  ON public.books (user_id, lower(title), lower(coalesce(author, '')));
CREATE INDEX books_user_idx ON public.books (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own books" ON public.books FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER books_touch BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.highlights
  ADD COLUMN book_id UUID REFERENCES public.books(id) ON DELETE SET NULL;
CREATE INDEX highlights_book_idx ON public.highlights (book_id);

-- Backfill: one book row per distinct (user, title, author) already highlighted.
INSERT INTO public.books (user_id, title, author)
SELECT DISTINCT ON (h.user_id, lower(h.book_title), lower(coalesce(h.author, '')))
       h.user_id, h.book_title, h.author
FROM public.highlights h
ON CONFLICT DO NOTHING;

UPDATE public.highlights h
SET book_id = b.id
FROM public.books b
WHERE b.user_id = h.user_id
  AND lower(b.title) = lower(h.book_title)
  AND lower(coalesce(b.author, '')) = lower(coalesce(h.author, ''))
  AND h.book_id IS NULL;