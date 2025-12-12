import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Search, Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/search", label: "Buy" },
    { href: "/sell", label: "Sell" },
    { href: "/valuation", label: "Valuation" },
    { href: "/history", label: "Car History" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-border py-3 shadow-sm" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-1.5 rounded-lg group-hover:bg-accent transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className={cn("font-heading font-bold text-xl tracking-tight transition-colors", scrolled ? "text-foreground" : "text-white")}>
              CARZONE
            </span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  location === link.href ? "text-accent" : scrolled ? "text-foreground/80" : "text-white/90 hover:text-white"
                )}
              >
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" className={cn("hover:bg-white/10", scrolled ? "text-foreground" : "text-white")}>
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("hover:bg-white/10", scrolled ? "text-foreground" : "text-white")}>
            <User className="w-5 h-5" />
          </Button>
          <Link href="/sell">
            <Button className="bg-accent hover:bg-accent/90 text-white border-0 font-medium px-6">
              List Your Car
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={scrolled ? "text-foreground" : "text-white"}>
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-10">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a className="text-lg font-medium text-foreground hover:text-accent">
                      {link.label}
                    </a>
                  </Link>
                ))}
                <Link href="/sell">
                  <Button className="w-full bg-accent text-white mt-4">List Your Car</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
