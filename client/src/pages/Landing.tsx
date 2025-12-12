import { motion } from "framer-motion";
import { ShieldCheck, Car, History, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/modern_luxury_car_in_minimalist_garage.png";
import shieldImage from "@assets/generated_images/abstract_verification_shield_icon.png";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="/api/login">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white text-lg px-8 py-6 h-auto">
                Get Started - It's Free
              </Button>
            </a>
            <a href="/search">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6 h-auto backdrop-blur">
                Browse Cars
              </Button>
            </a>
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
