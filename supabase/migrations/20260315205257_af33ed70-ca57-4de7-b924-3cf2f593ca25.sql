
INSERT INTO storage.buckets (id, name, public)
VALUES ('csv-data', 'csv-data', false);

CREATE POLICY "Authenticated users can read csv-data"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'csv-data');
