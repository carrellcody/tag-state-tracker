import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function AntelopeLeftovers() {
  return (
    <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <SEOHead
        title="Colorado Pronghorn Secondary & Leftover Draws | TalloTags"
        description="Colorado pronghorn secondary and leftover draw information — coming soon."
        canonicalPath="/Antelope-Leftovers"
      />
      <h1 className="text-4xl font-bold mb-4">Secondary / Leftover Draws</h1>
      <p className="text-xl text-muted-foreground mb-6">Stay tuned - coming soon!</p>
      <Button asChild size="lg">
        <Link to="/profile#tag-alerts">
          <Bell className="mr-2 h-5 w-5" />
          Sign up for tag alerts
        </Link>
      </Button>
    </div>
  );
}
