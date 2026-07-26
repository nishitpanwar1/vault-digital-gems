GRANT INSERT ON public.subscribers TO anon;
GRANT SELECT, INSERT ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;