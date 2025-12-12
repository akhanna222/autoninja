import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, Bell, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AuthModal from "@/components/ui/AuthModal";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const isHome = location === "/";
  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = isAuthenticated ? [
    { href: "/search", label: "Buy" },
    { href: "/sell", label: "Sell" },
    { href: "/alerts", label: "My Alerts" },
    { href: "/about", label: "About" },
  ] : [
    { href: "/search", label: "Buy" },
    { href: "/sell", label: "Sell" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isHome && !scrolled 
          ? "bg-transparent border-transparent py-5" 
          : "bg-background/80 backdrop-blur-md border-border py-3 shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-1.5 rounded-lg group-hover:bg-accent transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className={cn(
              "font-heading font-bold text-xl tracking-tight transition-colors", 
              isHome && !scrolled ? "text-white" : "text-foreground"
            )}>
              AUTONINJA
            </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  location === link.href 
                    ? "text-accent" 
                    : isHome && !scrolled ? "text-white/90 hover:text-white" : "text-foreground/80 hover:text-foreground"
                )}>
                {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/alerts">
                <Button variant="ghost" size="icon" className={cn("hover:bg-accent/10", isHome && !scrolled ? "text-white hover:bg-white/10" : "text-foreground")}>
                  <Bell className="w-5 h-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("rounded-full", isHome && !scrolled ? "hover:bg-white/10" : "")}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-accent text-white">
                        {user?.firstName?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/alerts" className="w-full cursor-pointer">
                      <Bell className="w-4 h-4 mr-2" /> My Alerts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/sell">
                <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-medium px-6">
                  List Your Car
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-accent hover:bg-accent/90 text-white border-0 font-medium px-6"
              >
                Sign Up / Sign In
              </Button>
              <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={isHome && !scrolled ? "text-white" : "text-foreground"}>
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground hover:text-accent">
                      {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link href="/sell">
                      <Button className="w-full bg-accent text-white">List Your Car</Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <Button 
                    className="w-full bg-accent text-white"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
