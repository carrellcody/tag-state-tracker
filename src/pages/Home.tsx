import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import taggoutLogo from "@/assets/longbluename.png";
import heroBg from "@/assets/hero-bg.jpg";

import { SEOHead } from "@/components/SEOHead";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="TalloTags - Colorado Big Game Draw Odds & Harvest Statistics"
        description="Colorado big game draw odds, harvest statistics, and preference point data for elk, mule deer, and pronghorn hunting. Free pronghorn stats, advanced filtering tools."
        canonicalPath="/"
      />
      
      {/* Promo Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm sm:text-base font-medium">
        <p>Become an early adopter and try TalloTags <span className="font-bold italic">For Free</span> with promo code <span className="font-bold">FIRSTYEAR</span> through March 15th</p>
        <Link to="/auth" className="inline-block mt-1 px-4 py-1.5 text-base font-bold border-2 border-primary-foreground rounded-md hover:bg-primary-foreground hover:text-primary transition-colors">
          Create an account to get started
        </Link>
      </div>

      {/* Hero Image Section */}
      <section
        className="relative bg-cover bg-center py-20 sm:py-28 md:py-36 px-4 flex items-center justify-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-['Inter']">
            Welcome to TalloTags
          </h1>
          <p className="mt-3 text-lg sm:text-xl md:text-2xl text-white/90 font-['Inter']">
            Colorado draw odds and harvest stats for Colorado hunters
          </p>
        </div>
      </section>

      {/* Logo Banner */}
      <section className="gradient-primary py-6 sm:py-8 px-1 flex items-center justify-center">
        <img src={taggoutLogo} alt="TalloTags Logo" className="h-14 sm:h-18 md:h-22 lg:h-26 mx-auto" />
      </section>

      {/* Welcome Text Section */}
      <section className="py-10 sm:py-14 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="text-lg sm:text-xl leading-relaxed text-foreground">
            Welcome to TalloTags, the newest, fastest, and most affordable way to sort and filter through the Colorado big game draw odds and harvest statistics. TalloTags has taken the hunting and harvest stats, drawn out reports, and unit information from thousands of pages of CPW documents, and combined them in a simple and easy to use table, where you can sort and filter through every big game tag and unit that Colorado offers for elk, mule deer, and pronghorn.{" "}
            <Link to="/auth" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">
              Start exploring today
            </Link>{" "}
            to find your next hunt! Head to the{" "}
            <Link to="/learn" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">
              learn page
            </Link>{" "}
            to watch a video explaining all the features.
          </p>
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
                Pronghorn Statistics
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
