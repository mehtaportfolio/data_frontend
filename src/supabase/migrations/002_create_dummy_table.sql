CREATE TABLE public.dummy_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_no INTEGER NOT NULL,
  index_no INTEGER NOT NULL,
  point_no NUMERIC NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dummy_table_created_at ON public.dummy_table(created_at DESC);
