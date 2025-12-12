import { motion } from "framer-motion";
import { Search, MapPin, ChevronRight, ShieldCheck, Car as CarIcon, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/modern_luxury_car_in_minimalist_garage.png";
import shieldImage from "@assets/generated_images/abstract_verification_shield_icon.png";
import { mockCars } from "@/lib/mockData";
import TrustBadge from "@/components/ui/TrustBadge";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Luxury Car Garage"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 tracking-tight">
              Trust Driven. <span className="text-accent">Verified.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 font-light">
              The new standard in buying and selling used cars. Every car verified by AI, every mile checked, every photo authenticated.
            </p>
          </motion.div>

          {/* Smart Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                  <Input
                    placeholder="Search by make, model, or reg..."
                    className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-accent"
                  />
                </div>
              </div>
              <div>
                <Select>
                  <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white focus:ring-accent">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10k">Under €10k</SelectItem>
                    <SelectItem value="20k">€10k - €20k</SelectItem>
                    <SelectItem value="50k">€20k - €50k</SelectItem>
                    <SelectItem value="50k+">€50k+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Link href="/search">
                <Button className="h-12 w-full bg-accent hover:bg-accent/90 text-white text-lg font-semibold">
                  Search Cars
                </Button>
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-white/70">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-accent" /> Logbook Verified</span>
              <span className="mx-2">•</span>
              <span className="flex items-center gap-1"><History className="w-4 h-4 text-accent" /> History Checked</span>
              <span className="mx-2">•</span>
              <span className="flex items-center gap-1"><CarIcon className="w-4 h-4 text-accent" /> Dealer & Private</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-border hover:border-accent/20 transition-all shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <img src={shieldImage} className="w-8 h-8 opacity-80" alt="Shield" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">AI Verification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes logbooks and car photos to verify ownership, detect fraud, and ensure the car matches the description.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-border hover:border-accent/20 transition-all shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <History className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Integrated History</h3>
              <p className="text-muted-foreground leading-relaxed">
                No more external checks. Every listing comes with a "Digital Car Health Passport" showing finance, accident, and mileage history.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-border hover:border-accent/20 transition-all shadow-sm hover:shadow-md group">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <CarIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Mileage Proof</h3>
              <p className="text-muted-foreground leading-relaxed">
                Sellers must upload recent odometer photos. We verify the timestamp and consistency with past records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-2">Trending Verified Cars</h2>
              <p className="text-muted-foreground">High-demand vehicles with perfect verification scores.</p>
            </div>
            <Link href="/search">
              <Button variant="ghost" className="gap-2 group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCars.map((car) => (
              <Link key={car.id} href={`/listing/${car.id}`}>
                <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={car.imageUrl}
                      alt={car.model}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm">
                      {car.year}
                    </div>
                    {car.verificationScore > 90 && (
                      <div className="absolute top-3 left-3 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading font-bold text-lg truncate pr-2">{car.make} {car.model}</h3>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-3">€{car.price.toLocaleString()}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <TrustBadge type="logbook" verified={car.badges.logbookVerified} showLabel={false} />
                      <TrustBadge type="mileage" verified={car.badges.mileageVerified} showLabel={false} />
                      <TrustBadge type="photos" verified={car.badges.photosVerified} showLabel={false} />
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground gap-4 border-t pt-3">
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                        {car.mileage.toLocaleString()} km
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {car.location}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
