CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  digest_enabled BOOLEAN NOT NULL DEFAULT true,
  digest_frequency TEXT NOT NULL DEFAULT 'daily',
  last_digest_at TIMESTAMPTZ,
  api_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX profiles_api_key_idx ON public.profiles(api_key);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  progress NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX documents_user_idx ON public.documents(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON public.documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  book_title TEXT NOT NULL,
  author TEXT,
  text TEXT NOT NULL,
  note TEXT,
  location TEXT,
  source TEXT NOT NULL DEFAULT 'reader',
  highlighted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX highlights_user_idx ON public.highlights(user_id, highlighted_at DESC);
CREATE UNIQUE INDEX highlights_dedupe_idx ON public.highlights(user_id, book_title, md5(text));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.highlights TO authenticated;
GRANT ALL ON public.highlights TO service_role;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own highlights" ON public.highlights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER documents_touch BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE doc_id UUID;
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.documents (user_id, title, author, source, progress, content)
  VALUES (
    NEW.id,
    'The Lantern Room',
    'Marguerite Halloway',
    'sample',
    42,
    E'The lamp in the corner had burned down to a whisper by the time she finished the line, and the room held the same soft, amber hush it always did on a Friday.\n\nShe had come here to forget, and forgot nothing. The chair creaked once, then stopped, as if the house had decided to keep her.\n\n"Attention is the rarest and purest form of generosity," she wrote in the margin, the pen scratching against the dark like a small, patient animal.\n\nOutside, the city kept its own slower rhythm. She turned the page and let the light do the rest.\n\nThere are rooms that hold a person the way a sentence holds a thought: loosely, and then all at once. She had learned to read slowly here, to let a paragraph sit unfinished while the kettle cooled, and to trust that the meaning would arrive on its own schedule.\n\nBy midnight the lamp had gone the colour of weak tea. She closed the book on her thumb, the way she had as a child, and listened to the house settle around the shape of her attention.'
  ) RETURNING id INTO doc_id;

  INSERT INTO public.highlights (user_id, document_id, book_title, author, text, location, source)
  VALUES
    (NEW.id, doc_id, 'The Lantern Room', 'Marguerite Halloway', 'Attention is the rarest and purest form of generosity.', 'p. 88', 'sample'),
    (NEW.id, doc_id, 'The Lantern Room', 'Marguerite Halloway', 'There are rooms that hold a person the way a sentence holds a thought: loosely, and then all at once.', 'p. 91', 'sample'),
    (NEW.id, NULL, 'Invisible Cities', 'Italo Calvino', 'Memory is redundant: it repeats signs so that the city can begin to exist.', 'p. 19', 'sample'),
    (NEW.id, NULL, 'The Myth of Sisyphus', 'Albert Camus', 'The struggle itself toward the heights is enough to fill a man''s heart.', 'p. 123', 'sample')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();