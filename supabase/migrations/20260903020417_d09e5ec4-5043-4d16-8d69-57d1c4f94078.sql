DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own documents" ON public.documents;
DROP POLICY IF EXISTS "Users manage own highlights" ON public.highlights;
DROP POLICY IF EXISTS "Users manage own books" ON public.books;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;
ALTER TABLE public.highlights DROP CONSTRAINT IF EXISTS highlights_user_id_fkey;
ALTER TABLE public.books DROP CONSTRAINT IF EXISTS books_user_id_fkey;

ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.documents ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.highlights ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.books ALTER COLUMN user_id TYPE TEXT USING user_id::text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS reading_goals TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'sub') = id)
  WITH CHECK ((auth.jwt() ->> 'sub') = id);
CREATE POLICY "Users manage own documents" ON public.documents FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users manage own highlights" ON public.highlights FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "Users manage own books" ON public.books FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);