import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { subscriptionStatus, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (subscriptionStatus?.subscribed) return;

    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setOpen(true);
      sessionStorage.setItem("hasSeenWelcome", "true");
    }
  }, [loading, subscriptionStatus]);
  const handleCreateAccount = () => {
    setOpen(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md text-center p-6">
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-xl sm:text-2xl text-foreground leading-tight font-extrabold whitespace-pre-line">
            Welcome!{"\n"}New feature! Sign up for Tag Alerts to get alerted whenever one of your tags becomes available on the leftover list.
          </h2>

          <p className="text-base sm:text-lg text-foreground leading-relaxed">
            Sign up now and try for free for 30 days! Only $20/year after that.
          </p>

          <Button
            onClick={handleCreateAccount}
            className="w-full sm:w-auto px-8"
            size="lg"
          >
            Create an account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
