import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, MapPin, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Colorado Big Game Draw & Harvest Stats
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Explore comprehensive draw odds and harvest statistics for Colorado deer, elk, and antelope hunting
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/deer">
              <Button size="lg" variant="secondary" className="font-semibold">
                Explore Draw Odds
              </Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Learn the Draw Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="shadow-subtle hover:shadow-medium transition-shadow">
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Draw Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Detailed draw odds for 2025 season across all Colorado units
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="shadow-subtle hover:shadow-medium transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Harvest Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  2024 harvest statistics including success rates and hunter density
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="shadow-subtle hover:shadow-medium transition-shadow">
              <CardHeader>
                <MapPin className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Unit Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Public land percentages, unit sizes, and geographic data
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="shadow-subtle hover:shadow-medium transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Advanced Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Filter by preference points, weapon type, season, and more
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Draw Statistics Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Draw Statistics 2025</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/deer">
              <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Deer</CardTitle>
                  <CardDescription>Draw Odds 2025</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Link to="/elk">
              <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Elk</CardTitle>
                  <CardDescription>Draw Odds 2025</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Link to="/antelope">
              <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Antelope</CardTitle>
                  <CardDescription>Draw Odds 2025</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Harvest Statistics Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Harvest Statistics 2024</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/deer-harvest">
              <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Deer</CardTitle>
                  <CardDescription>Harvest Stats 2024</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Link to="/elk-harvest">
              <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Elk</CardTitle>
                  <CardDescription>Harvest Stats 2024</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Link to="/antelope-harvest">
              <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Antelope</CardTitle>
                  <CardDescription>Harvest Stats 2024</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Colorado Resources */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Colorado Parks & Wildlife Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <a
              href="https://cpw.widencollective.com/assets/share/asset/erjzbk48be"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full h-20">
                2025 Big Game Brochure
              </Button>
            </a>
            <a
              href="https://cpw.state.co.us/hunting/big-game/elk/statistics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full h-20">
                Elk Statistics
              </Button>
            </a>
            <a
              href="https://cpw.state.co.us/hunting/big-game/deer/statistics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full h-20">
                Deer Statistics
              </Button>
            </a>
            <a
              href="https://cpw.state.co.us/hunting/big-game/pronghorn/statistics"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full h-20">
                Antelope Statistics
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
