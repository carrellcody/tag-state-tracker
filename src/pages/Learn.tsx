import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import preferencePointsDistribution from "@/assets/preference-points-distribution.png";
export default function Learn() {
  return <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Colorado Big Game Draw</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Understanding how Colorado's preference point system and draw process works
      </p>

      <Alert className="mb-8">
        <Info className="h-5 w-5" />
        <AlertDescription>
          This page explains the Colorado big game draw system. All information is based on Colorado Parks & Wildlife
          regulations. Always refer to the official CPW Big Game Brochure for the most current rules.
        </AlertDescription>
      </Alert>


      <div className="space-y-8">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Colorado Big Game Draw System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Colorado uses a preference point system to allocate limited hunting licenses for deer, elk, and antelope.
              Other species such as sheep, moose and mountain goats use a weighted point system, but currently Taggout
              is not set up to analyze draws other than Deer , Elk and Antelope. Not all units and seasons require a
              draw - some elk and antelope tags are available over-the-counter (OTC) without having to go through the
              draw.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Preference Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong>How do you get preference points?</strong> Once preference point can be accumulated each year you
              apply for a draw license but don't draw a tag (For example, if you apply for a tag that requires more
              preference points than you currently have). You can also simply specify that you would like to purchase a
              preference point. The application for preference points is due the same time that the draw application is
              due (Typically early April).
            </p>
            <p>
              <strong>How do they work?</strong>The more points you have, the more tags become available to draw. For
              example, assume that there are 100 tags available for a unit and 90 hunters apply who have 2 preference
              points, 20 hunters apply with 1 preference point, and 500 hunters apply with 0 preference points. In this
              scenario all 90 of the 2 preference point applicants will receive a tag, meaning that there are 10
              remaining tags. Therefore 10 of the 20 who applied with 1 point will receive a tag, and this is determined
              by a random lottery-style draw. Finally, none of the 0 point applicants will receive a tag.
            </p>
            <div className="mt-6 flex justify-center">
              <img src={preferencePointsDistribution} alt="Preference points distribution diagram showing how tags are allocated based on point levels" className="w-full max-w-3xl rounded-lg border border-border" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Draw Dates and Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              2026 dates will be revealed once the Big Game Brochure is published. The draw typically opens in early
              March and closes in early April. Draw results are typically posted in late May. Secondary Draw typically
              opens in mid June and closes at the end of June (These are leftover tags that were either not drawn in the
              primary draw                                                  
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Tag "List" Designation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong>List A:</strong> You can only get ONE List A license
            </p>
            <p>
              <strong>List B:</strong> If a hunt is List B, you can get up to TWO licenses: one List A license and one
              List B license, or two List B licenses (e.g. A+B or B+B)
            </p>
            <p>
              <strong>List C:</strong> If a hunt is List C, you can get ANY number of List C licenses, as well as one
              List A license and one List B license, or two List B licenses (e.g. A+B+C+C+C, etc. or B+B+C+C+C, etc.)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Hunter Classifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <p>
              <strong>Resident vs. Non-Resident:</strong> Colorado residents get a larger percentage of tags (typically
              65-80% depending on species). Non-residents compete for the remaining allocation.
            </p>
            <p>
              <strong>Adult vs. Youth:</strong> Youth hunters (under 18) have separate draws with generally better odds
              for many units.
            </p>
            <p>
              <strong>Landowner Tags:</strong> Private landowners with qualifying properties can receive preference for
              tags in their area or transferable vouchers.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium"></Card>

        <div className="bg-muted/50 p-6 rounded-lg border border-border">
          <h3 className="font-semibold text-lg mb-3">Additional Resources</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Colorado Parks & Wildlife - Big Game Information
              </a>
            </li>
            <li>
              <a href="https://cpw.widencollective.com/assets/share/asset/erjzbk48be" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                2025 Big Game Brochure (Official Rules)
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/elk/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Elk Statistics
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/deer/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Deer Statistics
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/pronghorn/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Pronghorn Statistics
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/bear/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Bear Statistics
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/moose/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Moose Statistics
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/bighorn-sheep/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Bighorn Sheep Statistics
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/mountain-goat/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Mountain Goat Statistics
              </a>
            </li>
            <li>
              <a href="https://cpw.state.co.us/hunting/big-game/mountain-lion/statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Mountain Lion Statistics
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>;
}