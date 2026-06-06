import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Users, CreditCard, FileText, Upload, Eye, Download, Mail, Send, FlaskConical, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";

interface FileEntry {
  name: string;
  size: number;
  updated_at: string;
}

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  files: FileEntry[];
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [fileLoading, setFileLoading] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [grantTarget, setGrantTarget] = useState("");
  const [grantBusy, setGrantBusy] = useState<"grant" | "revoke" | null>(null);

  const runGrant = async (action: "grant" | "revoke") => {
    const target = grantTarget.trim();
    if (!target) {
      toast({ title: "Enter an email or user ID", variant: "destructive" });
      return;
    }
    if (action === "revoke" && !confirm(`Revoke Pro access from ${target}?`)) return;
    setGrantBusy(action);
    try {
      const { data, error } = await supabase.functions.invoke("admin-grant-subscription", {
        body: { target, action },
      });
      if (error) throw error;
      const p = (data as any)?.profile;
      toast({
        title: action === "grant" ? "Pro access granted" : "Pro access revoked",
        description: p ? `${p.email} → ${p.subscription_status}` : "Done",
      });
      setGrantTarget("");
    } catch (err: any) {
      toast({ title: "Action failed", description: err.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setGrantBusy(null);
    }
  };

  const loadRecentRuns = async () => {
    setRunsLoading(true);
    const { data, error } = await supabase
      .from("leftover_alert_log")
      .select("id, run_id, recipient_email, match_count, status, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error) setRecentRuns(data || []);
    setRunsLoading(false);
  };

  const sendTest = async () => {
    setSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-leftover-tag-alerts", {
        body: { mode: "test" },
      });
      if (error) throw error;
      toast({ title: "Test email sent", description: `Sent to ${(data as any)?.sent_to ?? "you"}` });
    } catch (err: any) {
      toast({ title: "Test send failed", description: err.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setSendingTest(false);
    }
  };

  const sendAll = async () => {
    if (!confirm("Send leftover-tag alert emails to ALL matching users now?")) return;
    setSendingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-leftover-tag-alerts", {
        body: { mode: "real" },
      });
      if (error) throw error;
      const d = data as any;
      toast({
        title: "Alert run complete",
        description: `Sent ${d?.sent ?? 0} email(s) · skipped ${d?.skipped ?? 0} of ${d?.users_with_alerts ?? 0} users with alerts.`,
      });
      loadRecentRuns();
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setSendingAll(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(error ? false : !!data);
    })();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setStatsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("admin-stats");
        if (error) throw error;
        setStats(data as Stats);
      } catch (err: any) {
        toast({
          title: "Failed to load stats",
          description: err.message ?? "Unknown error",
          variant: "destructive",
        });
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [isAdmin, toast]);

  useEffect(() => {
    if (isAdmin) loadRecentRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const downloadFile = async (name: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const url = `https://nbkybwnjjzmwyiiciffm.supabase.co/functions/v1/serve-csv?file=${encodeURIComponent(name)}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      toast({
        title: "Download failed",
        description: err.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  };

  const viewFile = async (name: string) => {
    setViewingFile(name);
    setFileLoading(true);
    setFileContent("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const url = `https://nbkybwnjjzmwyiiciffm.supabase.co/functions/v1/serve-csv?file=${encodeURIComponent(name)}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
      const text = await res.text();
      // Limit preview to first ~500 lines for performance
      const lines = text.split("\n");
      const preview = lines.slice(0, 500).join("\n");
      setFileContent(
        lines.length > 500
          ? `${preview}\n\n... (${lines.length - 500} more rows truncated)`
          : preview
      );
    } catch (err: any) {
      setFileContent(`Error: ${err.message}`);
    } finally {
      setFileLoading(false);
    }
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
      <SEOHead title="Admin Dashboard | TalloTags" description="Admin dashboard" />
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <Button asChild>
            <Link to="/admin/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSVs
            </Link>
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalUsers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.activeSubscriptions ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active Stripe subscriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* File list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Data Files
            </CardTitle>
            <CardDescription>
              {stats ? `${stats.files.length} file(s) in storage` : "Loading..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !stats?.files.length ? (
              <p className="text-sm text-muted-foreground py-4">No files uploaded yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {stats.files.map((f) => (
                  <div key={f.name} className="flex items-center gap-3 py-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-foreground truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(f.size)}
                        {f.updated_at && ` • Updated ${new Date(f.updated_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => viewFile(f.name)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadFile(f.name)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leftover tag alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Leftover Tag Alerts
            </CardTitle>
            <CardDescription>
              Sends to every user whose saved tag alerts match this week's leftover CSVs
              (<span className="font-mono">elk_/deer_/ant__Current_Leftover_Tags.csv</span>).
              Auto-runs every Monday at 8:00 AM Mountain Time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={sendAll} disabled={sendingAll}>
                {sendingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send all alerts now
              </Button>
              <Button variant="outline" onClick={sendTest} disabled={sendingTest}>
                {sendingTest ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FlaskConical className="h-4 w-4 mr-2" />}
                Send test to me
              </Button>
              <Button variant="ghost" size="sm" onClick={loadRecentRuns} disabled={runsLoading}>
                {runsLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Refresh log
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Recent sends (last 20)</h3>
              {recentRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sends logged yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40">
                      <tr className="text-left">
                        <th className="px-3 py-2 font-medium">When</th>
                        <th className="px-3 py-2 font-medium">Recipient</th>
                        <th className="px-3 py-2 font-medium">Matches</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRuns.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-3 py-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                          <td className="px-3 py-2 font-mono">{r.recipient_email}</td>
                          <td className="px-3 py-2">{r.match_count}</td>
                          <td className={`px-3 py-2 font-medium ${r.status === "sent" ? "text-primary" : "text-destructive"}`}>
                            {r.status}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground truncate max-w-[200px]">{r.error_message ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File viewer dialog */}
        <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm break-all">{viewingFile}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto rounded-md border border-border bg-muted/30">
              {fileLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <pre className="text-xs font-mono p-4 whitespace-pre text-foreground">
                  {fileContent}
                </pre>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminDashboard;
