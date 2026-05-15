DROP POLICY IF EXISTS "Authenticated users can read csv-data" ON storage.objects;

CREATE POLICY "Admins can read csv-data"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'csv-data' AND has_role(auth.uid(), 'admin'::app_role));