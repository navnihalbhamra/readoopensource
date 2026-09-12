ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS digest_email text,
  ADD COLUMN IF NOT EXISTS linked_emails text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_source text,
  ADD COLUMN IF NOT EXISTS plan_renews_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS paddle_customer_id text,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id text;

CREATE INDEX IF NOT EXISTS profiles_paddle_customer_idx ON public.profiles (paddle_customer_id);
CREATE INDEX IF NOT EXISTS profiles_paddle_subscription_idx ON public.profiles (paddle_subscription_id);