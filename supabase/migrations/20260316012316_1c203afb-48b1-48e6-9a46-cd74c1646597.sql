CREATE POLICY "Admins can upload to csv-data"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'csv-data' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update csv-data"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'csv-data' AND public.has_role(auth.uid(), 'admin'));