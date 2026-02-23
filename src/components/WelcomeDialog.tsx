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
            src={taggoutLogo} 
            alt="TalloTags Logo" 
            className="h-16 sm:h-20"
          />
          
          {/* Welcome Text */}
          <p className="text-base sm:text-lg text-foreground leading-relaxed">
            Welcome to TalloTags - Browse antelope stats for free to get a feel for the site and subscribe to see the deer and elk stats! Use code <span className="font-bold text-primary">FIRSTYEAR</span> to get your first year free! <span className="text-muted-foreground text-sm">(Offer expires end of February)</span>
          </p>
          
          {/* Pricing */}
          <div className="flex items-center justify-center gap-3 text-xl sm:text-2xl font-bold">
            <span className="text-primary">First year free!</span>
          </div>
          
          {/* CTA Button */}
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
