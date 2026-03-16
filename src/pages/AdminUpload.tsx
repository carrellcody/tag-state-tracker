import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, XCircle, Loader2, Trash2, FileText } from 'lucide-react';
import SEOHead from '@/components/SEOHead';

const ALLOWED_FILES = [
  "DeerDraw25Subtable.csv",
  "DeerOTC25.csv",
  "ant25code_pages.csv",
  "deer25code_pages.csv",
  "elk25code_pages.csv",
  "elkOTC24.csv",
  "gmu_public_land.csv",
  "DeerHarvest24.csv",
  "DeerOTC24.csv",
  "FullDeer25Final.csv",
  "FullDeer26Final.csv",
  "FullDeer26FinalNewHarv.csv",
  "Fullant25Final.csv",
  "Fullant26Final.csv",
  "Fullelk25Final.csv",
  "Fullelk26Final.csv",
  "antHarvest25.csv",
  "antOTC24.csv",
  "elkHarvest25.csv",
];

interface UploadResult {
  filename: string;
  status: 'success' | 'error' | 'uploading';
  message?: string;
}

const AdminUpload: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Check admin role
  React.useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      setIsAdmin(error ? false : !!data);
    };
    checkAdmin();
  }, [user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...dropped.filter(f => !existing.has(f.name))];
    });
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).filter(f => f.name.endsWith('.csv'));
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...selected.filter(f => !existing.has(f.name))];
    });
    e.target.value = '';
  };

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    setResults(prev => prev.filter(r => r.filename !== name));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setResults(files.map(f => ({ filename: f.name, status: 'uploading' })));

    for (const file of files) {
      // Validate against allowlist
      if (!ALLOWED_FILES.includes(file.name)) {
        setResults(prev =>
          prev.map(r =>
            r.filename === file.name
              ? { ...r, status: 'error', message: `Not in allowlist. Expected one of: ${ALLOWED_FILES.join(', ')}` }
              : r
          )
        );
        continue;
      }

      try {
        const { error } = await supabase.storage
          .from('csv-data')
          .upload(file.name, file, { upsert: true });

        if (error) throw error;

        setResults(prev =>
          prev.map(r =>
            r.filename === file.name
              ? { ...r, status: 'success', message: 'Uploaded successfully' }
              : r
          )
        );
      } catch (err: any) {
        setResults(prev =>
          prev.map(r =>
            r.filename === file.name
              ? { ...r, status: 'error', message: err.message || 'Upload failed' }
              : r
          )
        );
      }
    }

    setUploading(false);
    const successCount = files.filter(f => ALLOWED_FILES.includes(f.name)).length;
    toast({
      title: 'Upload complete',
      description: `${successCount} file(s) processed`,
    });
  };

  if (loading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SEOHead title="Admin Upload | TalloTags" description="Upload CSV data files" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Upload CSV Data</CardTitle>
            <CardDescription>
              Drag and drop CSV files or click to select. Files must match the expected filenames.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-foreground font-medium">Drop CSV files here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Files ({files.length})</h3>
                {files.map(file => {
                  const result = results.find(r => r.filename === file.name);
                  const isAllowed = ALLOWED_FILES.includes(file.name);
                  return (
                    <div key={file.name} className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border border-border">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-mono truncate ${isAllowed ? 'text-foreground' : 'text-destructive'}`}>
                          {file.name}
                        </p>
                        {!isAllowed && (
                          <p className="text-xs text-destructive">Not in allowlist</p>
                        )}
                        {result?.message && (
                          <p className={`text-xs ${result.status === 'success' ? 'text-primary' : 'text-destructive'}`}>
                            {result.message}
                          </p>
                        )}
                      </div>
                      {result?.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {result?.status === 'success' && <CheckCircle className="h-4 w-4 text-primary" />}
                      {result?.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                      {!uploading && (
                        <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)} className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload button */}
            <Button
              onClick={uploadFiles}
              disabled={uploading || files.length === 0}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} file{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {/* Allowlist reference */}
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View accepted filenames
              </summary>
              <ul className="mt-2 space-y-1 pl-4">
                {ALLOWED_FILES.map(f => (
                  <li key={f} className="font-mono text-xs text-muted-foreground">{f}</li>
                ))}
              </ul>
            </details>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminUpload;
