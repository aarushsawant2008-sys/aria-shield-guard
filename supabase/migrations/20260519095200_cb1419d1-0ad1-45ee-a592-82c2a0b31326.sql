
CREATE TABLE public.cases (
  id TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  pan TEXT NOT NULL,
  score INT NOT NULL DEFAULT 50,
  rag TEXT NOT NULL DEFAULT 'YELLOW',
  rag_label TEXT NOT NULL DEFAULT 'MEDIUM',
  flag TEXT NOT NULL DEFAULT '',
  submitted TEXT NOT NULL DEFAULT 'just now',
  is_critical_str BOOLEAN NOT NULL DEFAULT false,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cases_public_read" ON public.cases FOR SELECT USING (true);
CREATE POLICY "cases_public_insert" ON public.cases FOR INSERT WITH CHECK (true);

CREATE INDEX cases_created_at_idx ON public.cases (created_at DESC);
