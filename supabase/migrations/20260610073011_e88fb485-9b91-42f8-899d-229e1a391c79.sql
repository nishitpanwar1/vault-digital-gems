
-- Public read for covers, admin write
CREATE POLICY "Covers are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-covers');

CREATE POLICY "Admins upload covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update covers"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete covers"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));

-- Product files: only authenticated users can read (downloaded via signed URL anyway), admin writes
CREATE POLICY "Authenticated read product files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-files');

CREATE POLICY "Admins upload product files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update product files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete product files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));
