
-- ============ PROFILES: hide email from anon ============
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, avatar_url, created_at) ON public.profiles TO anon;
GRANT SELECT (id, full_name, avatar_url, created_at, email) ON public.profiles TO authenticated;

-- ============ STORAGE product-files: gate on purchase/download ============
DROP POLICY IF EXISTS "Authenticated read product files" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage product files" ON storage.objects;

CREATE POLICY "Admins manage product files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Buyers read their product files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'product-files'
  AND EXISTS (
    SELECT 1 FROM public.downloads d
    JOIN public.products p ON p.id = d.product_id
    WHERE d.user_id = auth.uid()
      AND (p.file_url LIKE '%' || storage.objects.name)
  )
);

-- ============ REALTIME: stop broadcasting sensitive tables ============
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'subscribers'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.subscribers';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.user_roles';
  END IF;
END $$;
