import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/learn", label: "Learn the Draw" },
    { to: "/about", label: "About Tag-Season" },
  ];

  const speciesMenus = [
    {
      label: "Deer",
      items: [
        { to: "/deer", label: "Draw Stats" },
        { to: "/deer-harvest", label: "Harvest Stats" },
      ],
    },
    {
      label: "Elk",
      items: [
        { to: "/elk", label: "Draw Stats" },
        { to: "/elk-harvest", label: "Harvest Stats" },
        { to: "/otc-elk", label: "OTC Stats" },
      ],
    },
    {
      label: "Antelope",
      items: [
        { to: "/antelope", label: "Draw Stats" },
        { to: "/antelope-harvest", label: "Harvest Stats" },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-subtle">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                Tag Season
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map((link) => (
                    <NavigationMenuItem key={link.to}>
                      <Link to={link.to}>
                        <Button
                          variant={isActive(link.to) ? "default" : "ghost"}
                          size="sm"
                          className="font-medium"
                        >
                          {link.label}
                        </Button>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                  {speciesMenus.map((menu) => (
                    <NavigationMenuItem key={menu.label}>
                      <NavigationMenuTrigger className="font-medium">
                        {menu.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="w-48 p-2">
                          {menu.items.map((item) => (
                            <li key={item.to}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.to}
                                  className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                                >
                                  {item.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Auth Button */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/auth">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-2 border-t border-border">
              {speciesMenus.map((menu) => (
                <div key={menu.label} className="space-y-1">
                  <div className="px-3 py-2 font-semibold text-sm">{menu.label}</div>
                  {menu.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(item.to) ? "default" : "ghost"}
                        className="w-full justify-start pl-6"
                        size="sm"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              ))}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(link.to) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Sign In
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Tag Season. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/about#contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
              <a
                href="https://cpw.state.co.us"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Colorado Parks & Wildlife
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
