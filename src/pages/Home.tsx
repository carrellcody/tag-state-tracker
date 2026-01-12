import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import taggoutLogo from "@/assets/Logo_Tallo-03.png";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary py-12 sm:py-16 md:py-10 px-1 flex items-center justify-center">
        <div>
          <img src={taggoutLogo} alt="Taggout Logo" className="h-16 sm:h-20 md:h-24 lg:h-28 mx-auto" />
        </div>
      </section>

      {/* Statistics Section */}
      <section id="draw-stats" className="py-8 sm:py-10 md:py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Draw Statistics */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center min-h-[4rem] flex items-center justify-center">
                Draw Statistics 2025
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Link to="/deer">
                    <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Deer</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/elk">
                    <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Elk</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>

                <Link to="/antelope" className="w-1/2">
                  <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Antelope</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Harvest Statistics */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center min-h-[4rem] flex items-center justify-center">
                Harvest Statistics 2024
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Link to="/deer-harvest">
                    <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Deer</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/elk-harvest">
                    <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Elk</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>

                <Link to="/antelope-harvest" className="w-1/2">
                  <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Antelope</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>

            {/* OTC Statistics */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center min-h-[4rem] flex items-center justify-center">
                OTC Statistics 2024
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Link to="/otc-deer">
                    <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Deer</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>

                  <Link to="/otc-elk">
                    <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Elk</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                </div>

                <Link to="/otc-antelope" className="w-1/2">
                  <Card className="shadow-subtle hover:shadow-medium transition-all hover:scale-105 cursor-pointer">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">Antelope</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-8 sm:py-10 md:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="aspect-video rounded-lg overflow-hidden shadow-medium">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/Gu5wuNdFANo"
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Colorado Resources */}
      <section className="py-8 sm:py-10 md:py-12 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
            Colorado Parks & Wildlife Resources
          </h2>
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
            <a href="https://cpw.state.co.us/hunting/big-game/elk/statistics" target="_blank" rel="noopener noreferrer">
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
