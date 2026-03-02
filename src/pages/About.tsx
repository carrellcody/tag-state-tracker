import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, MapPin, FileText, Tag } from "lucide-react";
import { SEOHead } from '@/components/SEOHead';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <SEOHead 
        title="About TalloTags | Colorado Big Game Hunting Statistics"
        description="Learn about TalloTags - your source for Colorado big game draw odds, harvest statistics, and preference point data."
        canonicalPath="/about"
      />
      <h1 className="text-4xl font-bold mb-8 text-center">About TalloTags</h1>
      
      <Card className="shadow-medium mb-8">
        <CardHeader>
          <CardTitle className="text-center">Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p className="text-center">TalloTags was created to help hunters make informed decisions about their big game application strategies across the west.  


We want to make this information easy to access for everyone, so are committed to offering an affordable yearly subscription fee.</p>
          <p>
            We started with Colorado, but have plans to expand across all western states, so stay tuned!
          </p>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center">What We Offer</h2>
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
        <div className="flex justify-center mt-6">
          <Card className="shadow-subtle hover:shadow-medium transition-shadow md:w-1/2">
            <CardHeader>
              <Tag className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Over The Counter Tag Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analyze over the counter tags with the most up to date harvest and unit data available
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
          <p>We're constantly working to improve TalloTags and expand our coverage. Future updates will include additional states, more species, and enhanced data visualization tools.</p>
          <p>
            All data is sourced from official Colorado Parks & Wildlife publications and is updated annually after each draw and hunting season.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
