import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Learn() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Learn the Colorado Big Game Draw</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Understanding how Colorado's preference point system and draw process works
      </p>

      <Alert className="mb-8">
        <Info className="h-5 w-5" />
        <AlertDescription>
          This page explains the Colorado big game draw system. All information is based on Colorado Parks & Wildlife regulations. Always refer to the official CPW Big Game Brochure for the most current rules.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>What is the Colorado Big Game Draw?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Colorado uses a preference point system combined with a weighted draw to allocate limited hunting licenses for deer, elk, antelope, and other big game species. Not all units and seasons require a draw - some tags are available over-the-counter (OTC).
            </p>
            <p>
              The draw system ensures fair distribution of limited tags while giving hunters who have been applying longer a better chance of drawing.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Preference Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            <strong>How do you get preference points?</strong> Once preference point can be accumulated each year you apply for a draw license but don't draw a tag (For example, if you apply for a tag that requires more preference points than you currently have). You can also simply specify that you would like to purchase a preference point. The application for preference points is due the same time that the draw application is due (Typically early April). 
          </p>
            <p>
              <strong>How do they work?</strong>The more points you have, the more tags become available to draw. For example, assume that there are 100 tags available for a unit and 90 hunters apply who have 2 preference points, 20 hunters apply with 1 preference point, and 500 hunters apply with 0 preference points. In this scenario all 90 of the 2 preference point applicants will receive a tag, meaning that there are 10 remaining tags. Therefore 10 of the 20 who applied with 1 point will receive a tag, and this is determined by a random lottery-style draw. Finally, none of the 0 point applicants will receive a tag.
            </p>
            
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Draw Process Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong>Early Spring (March-April):</strong> Application period opens. Research units, check draw odds from previous years, and submit your applications.
            </p>
            <p>
              <strong>Late Spring (May-June):</strong> The draw takes place. Results are typically released in late May or early June.
            </p>
            <p>
              <strong>Summer:</strong> Successful applicants receive their licenses. Plan your hunt, scout your unit, and prepare.
            </p>
            <p>
              <strong>Fall:</strong> Hunting seasons run from late August through November depending on species and weapon type.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Application Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong>First Choice:</strong> Your first choice should be the unit you most want to hunt. This is your primary application and typically has the best chance of drawing.
            </p>
            <p>
              <strong>Second Choice:</strong> Choose a unit with better odds as a backup. If you don't draw your first choice, you'll be entered in the second choice draw.
            </p>
            <p>
              <strong>Weighted vs. Preference-Only Units:</strong> Some premium units are "preference point only" meaning all tags go to the applicants with the most points. Most units use the weighted system where you still have a chance even with fewer points.
            </p>
            <p>
              <strong>Building Points:</strong> Many hunters build points for several years before applying for premium units with low draw odds. Use Tag Season's filters to find which units match your current point level.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Hunter Classifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <p>
              <strong>Resident vs. Non-Resident:</strong> Colorado residents get a larger percentage of tags (typically 65-80% depending on species). Non-residents compete for the remaining allocation.
            </p>
            <p>
              <strong>Adult vs. Youth:</strong> Youth hunters (under 18) have separate draws with generally better odds for many units.
            </p>
            <p>
              <strong>Landowner Tags:</strong> Private landowners with qualifying properties can receive preference for tags in their area or transferable vouchers.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Using Tag Season to Plan Your Hunt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Tag Season aggregates draw odds and harvest statistics to help you make informed decisions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Filter units by your current preference points to see realistic options</li>
              <li>Compare harvest success rates to gauge hunting quality</li>
              <li>Check public land percentages to ensure access</li>
              <li>Review hunter density to find less crowded units</li>
              <li>Track historical draw odds to predict future trends</li>
            </ul>
          </CardContent>
        </Card>

        <div className="bg-muted/50 p-6 rounded-lg border border-border">
          <h3 className="font-semibold text-lg mb-3">Additional Resources</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a
                href="https://cpw.state.co.us/hunting/big-game"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Colorado Parks & Wildlife - Big Game Information
              </a>
            </li>
            <li>
              <a
                href="https://cpw.widencollective.com/assets/share/asset/erjzbk48be"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                2025 Big Game Brochure (Official Rules)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
