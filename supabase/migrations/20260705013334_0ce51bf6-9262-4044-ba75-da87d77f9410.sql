
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payfast_pf_payment_id text;

CREATE INDEX IF NOT EXISTS orders_payment_reference_idx ON public.orders (payment_reference);
