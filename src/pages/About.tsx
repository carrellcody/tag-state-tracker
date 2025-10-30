import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

      <Card className="shadow-medium mb-8">
        <CardHeader>
          <CardTitle>What We Offer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-2">Draw Statistics</h3>
              <p className="text-muted-foreground">
                Comprehensive draw odds for deer, elk, and antelope across all Colorado Game Management Units (GMUs). Filter by hunter class, preference points, weapon type, and more.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Harvest Data</h3>
              <p className="text-muted-foreground">
                Historical harvest statistics including success rates, hunter density, and public land access percentages to help you evaluate hunting quality.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Advanced Filtering</h3>
              <p className="text-muted-foreground">
                Powerful search and filter tools to narrow down units based on your specific criteria and hunting preferences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
