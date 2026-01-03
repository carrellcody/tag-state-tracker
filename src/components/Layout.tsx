import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getTierFromProductId, canAccessElk, canAccessDeer } from "@/utils/subscriptionTiers";

import taggoutLogosmall from "@/assets/L4.png";
interface LayoutProps {
  children: React.ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const { user, signOut, subscriptionStatus, loading } = useAuth();
  const navLinks = [
    {
      to: "/",
      label: "Home",
    },
    {
      to: "/learn",
      label: "Learn",
    },
    {
      to: "/about",
      label: "About TalloTags",
    },
  ];
  const speciesMenus = [
    {
      label: "Deer",
      type: "deer" as const,
      items: [
        {
          to: "/deer",
          label: "Draw Stats",
        },
        {
          to: "/deer-harvest",
          label: "Harvest Stats",
        },
        {
          to: "/otc-deer",
          label: "OTC Stats",
        },
      ],
    },
    {
      label: "Elk",
      type: "elk" as const,
      items: [
        {
          to: "/elk",
          label: "Draw Stats",
        },
        {
          to: "/elk-harvest",
          label: "Harvest Stats",
        },
        {
          to: "/otc-elk",
          label: "OTC Stats",
        },
      ],
    },
    {
      label: "Antelope",
      type: "antelope" as const,
      items: [
        {
          to: "/antelope",
          label: "Draw Stats",
        },
        {
          to: "/antelope-harvest",
          label: "Harvest Stats",
        },
        {
          to: "/otc-antelope",
          label: "OTC Stats",
        },
      ],
    },
  ];
  const currentTier = getTierFromProductId(subscriptionStatus?.product_id || null);
  // While loading, assume user has access to avoid greying out menus prematurely
  const hasElkAccess = loading ? true : canAccessElk(currentTier);
  const hasDeerAccess = loading ? true : canAccessDeer(currentTier);
  const handleRestrictedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSubscriptionDialog(true);
  };
  const isActive = (path: string) => location.pathname === path;
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-subtle">
        <div className="container mx-auto px-4">
          <div className="flex h-11 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src={taggoutLogosmall} className="h-full max-h-11 w-auto object-contain" alt="Logo" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {/* Primary links */}
              <NavigationMenu>
                <NavigationMenuList>
                  {navLinks.map((link) => (
                    <NavigationMenuItem key={link.to}>
                      <Link to={link.to}>
                        <Button variant={isActive(link.to) ? "default" : "ghost"} size="sm" className="font-medium">
                          {link.label}
                        </Button>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>

              {/* Species menus - separate roots so each dropdown anchors under its own trigger */}
              {speciesMenus.map((menu) => {
                const isRestricted = (menu.type === "elk" && !hasElkAccess) || (menu.type === "deer" && !hasDeerAccess);
                return (
                  <NavigationMenu key={menu.label}>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger
                          className={`font-medium ${isRestricted ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={isRestricted}
                        >
                          {menu.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="w-48 p-2 bg-popover">
                            {menu.items.map((item) => (
                              <li key={item.to}>
                                <NavigationMenuLink asChild>
                                  {isRestricted ? (
                                    <button
                                      onClick={handleRestrictedClick}
                                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors opacity-50 cursor-not-allowed"
                                    >
                                      {item.label}
                                    </button>
                                  ) : (
                                    <Link
                                      to={item.to}
                                      className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                                    >
                                      {item.label}
                                    </Link>
                                  )}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                );
              })}
            </nav>

            {/* Auth Button / User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <UserCircle className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-2 border-t border-border">
              {speciesMenus.map((menu) => {
                const isRestricted = (menu.type === "elk" && !hasElkAccess) || (menu.type === "deer" && !hasDeerAccess);
                return (
                  <div key={menu.label} className="space-y-1">
                    <div className={`px-3 py-2 font-semibold text-sm ${isRestricted ? "opacity-50" : ""}`}>
                      {menu.label}
                    </div>
                    {menu.items.map((item) =>
                      isRestricted ? (
                        <button
                          key={item.to}
                          onClick={(e) => {
                            setMobileMenuOpen(false);
                            handleRestrictedClick(e);
                          }}
                          className="w-full"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start pl-6 opacity-50 cursor-not-allowed"
                            size="sm"
                          >
                            {item.label}
                          </Button>
                        </button>
                      ) : (
                        <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={isActive(item.to) ? "default" : "ghost"}
                            className="w-full justify-start pl-6"
                            size="sm"
                          >
                            {item.label}
                          </Button>
                        </Link>
                      ),
                    )}
                  </div>
                );
              })}
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant={isActive(link.to) ? "default" : "ghost"} className="w-full justify-start">
                    {link.label}
                  </Button>
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-[10px]">
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

      {/* Subscription Dialog */}
      <AlertDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pro Plan Required</AlertDialogTitle>
            <AlertDialogDescription>Purchase pro plan to view deer and elk data</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSubscriptionDialog(false);
                window.open("https://buy.stripe.com/7sYfZhaewf7795M0n83AY00");
              }}
            >
              Subscribe Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
