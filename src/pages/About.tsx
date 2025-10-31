import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, MapPin, FileText } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">About Tag Season</h1>
      
      <Card className="shadow-medium mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Tag Season was created to help hunters make informed decisions about Colorado big game hunting opportunities. We aggregate and present official Colorado Parks & Wildlife statistics in an accessible, filterable format.
          </p>
          <p>
            Whether you're planning your first Colorado hunt or you're a seasoned hunter looking to optimize your preference point strategy, Tag Season provides the data you need to make smart decisions.
          </p>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <Target className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Draw Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed draw odds for 2025 season across all Colorado units
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Harvest Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                2024 harvest statistics including success rates and hunter density
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <MapPin className="h-10 w-10 text-secondary mb-2" />
              <CardTitle>Unit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Public land percentages, unit sizes, and geographic data
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-subtle hover:shadow-medium transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Advanced Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Filter by preference points, weapon type, season, and more
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Future Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            We're constantly working to improve Tag Season and expand our coverage. Future updates will include additional states, more species, and enhanced data visualization tools.
          </p>
          <p>
            All data is sourced from official Colorado Parks & Wildlife publications and is updated annually after each draw and hunting season.
          </p>
        </CardContent>
      </Card>

      <div className="mt-12 text-center text-muted-foreground">
        <p>Have questions or feedback? We'd love to hear from you.</p>
      </div>
    </div>
  );
}
