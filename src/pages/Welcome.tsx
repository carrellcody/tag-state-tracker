import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import taggoutLogo from "@/assets/blacktext-logo.png";

export default function Welcome() {
  const { checkSubscription, session } = useAuth();

  useEffect(() => {
    if (session) {
      checkSubscription();
    }
  }, [session]);

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
