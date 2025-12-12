import { motion } from "framer-motion";
import { ShieldCheck, Car, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/modern_luxury_car_in_minimalist_garage.png";
import shieldImage from "@assets/generated_images/abstract_verification_shield_icon.png";

export default function Landing() {
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
              The new standard in buying and selling. Every car verified by AI, every mile checked, every photo authenticated.
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
              <span className="flex items-center gap-1"><Car className="w-4 h-4 text-accent" /> Dealer & Private</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">Why Choose Carzone?</h2>
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
                <Car className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Smart Alerts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Set your preferences and get instant WhatsApp notifications when a car matching your criteria is listed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to find your perfect car?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of buyers and sellers who trust Carzone for verified, transparent car transactions.
          </p>
          <a href="/api/login">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white text-lg px-8 py-6 h-auto">
              Sign Up Now
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
