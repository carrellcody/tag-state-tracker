import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import taggoutLogo from "@/assets/blacktext-logo.png";

export default function Welcome() {
  const { checkSubscription, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const success = params.get("success");

    if (success === "true" && sessionId && session) {
      syncAfterCheckout(sessionId);
      window.history.replaceState({}, "", "/welcome");
    }
  }, [session]);

  const syncAfterCheckout = async (sessionId: string) => {
    try {
      await supabase.functions.invoke("update-promo-code", {
        body: { session_id: sessionId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      await checkSubscription();
      toast({
        title: "Subscription activated!",
        description: "Your Pro subscription is now active.",
      });
    } catch (error) {
      console.error("Error syncing after checkout:", error);
      toast({
        title: "Payment successful",
        description: "Your subscription may take a moment to activate.",
      });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center text-center space-y-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground max-w-2xl leading-tight">
        Thank you for joining the TalloTags community – Enjoy your access to the full set of Colorado big game stats!
      </h1>
      <img
        src={taggoutLogo}
        alt="TalloTags Logo"
        className="h-24 sm:h-32"
      />
    </div>
  );
}
