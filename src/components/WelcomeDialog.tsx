import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import taggoutLogo from "@/assets/blacktext-logo.png";
import { useAuth } from "@/contexts/AuthContext";

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { subscriptionStatus, loading } = useAuth();

  useEffect(() => {
    // Don't show while loading subscription status
    if (loading) return;
    
    // Don't show if user has an active subscription
    if (subscriptionStatus?.subscribed) return;
    
    // Only show if this is the first visit this session
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    
    // Check if user came from external source (no referrer or different origin)
    const isExternalVisit = !document.referrer || 
      !document.referrer.includes(window.location.origin);
    
    if (!hasSeenWelcome && isExternalVisit) {
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
          {/* Logo */}
          <img 
          {/* Headline */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
            New feature! Sign up for Tag Alerts to get alerted whenever one of your tags becomes available on the leftover list.
          </h2>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-foreground leading-relaxed">
            Sign up now and try for free for 30 days! Only $20/year after that.
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleCreateAccount}
            className="w-full sm:w-auto px-8"
            size="lg"
          >
            Create an account
          </Button>
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
