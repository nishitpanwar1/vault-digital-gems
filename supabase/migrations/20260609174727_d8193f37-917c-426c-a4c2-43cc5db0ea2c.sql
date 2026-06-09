REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

DROP POLICY IF EXISTS "Published products are public" ON public.products;
CREATE POLICY "Published products are public"
ON public.products
FOR SELECT
TO public
USING (is_published = true);

CREATE POLICY "Admins read all products"
ON public.products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));