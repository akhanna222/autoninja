import { motion } from "framer-motion";
import { ShieldCheck, Users, Heart, Mail, Target, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-primary text-white p-3 rounded-xl">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary">AutoNinja</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforming the used car industry with trust, transparency, and technology.
          </p>
        </motion.div>

        {/* Our Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trust First</h3>
              <p className="text-muted-foreground text-sm">
                Every vehicle is verified. Every seller is accountable. We believe trust is the foundation of every great transaction.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Transparency</h3>
              <p className="text-muted-foreground text-sm">
                No hidden surprises. Complete vehicle history, verified mileage, and authentic photos for every listing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Innovation</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered verification, smart alerts, and cutting-edge technology to make car buying seamless.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Team */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Our Team</h2>
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Built by Car Enthusiasts</h3>
                <p className="text-muted-foreground">For car buyers and sellers everywhere</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              AutoNinja was founded by a team of passionate car enthusiasts and technology experts 
              who were frustrated with the lack of trust and transparency in the used car market. 
              We've combined our love for cars with cutting-edge AI technology to create a platform 
              where buyers can shop with confidence and sellers can reach genuine customers.
            </p>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">Customer Support</h2>
          <div className="bg-accent/5 border border-accent/20 p-8 rounded-2xl text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Our customer support team is here to assist you with any questions or concerns.
            </p>
            <a 
              href="mailto:customersupport@autoninja.com" 
              className="text-accent hover:text-accent/80 font-medium text-lg"
              data-testid="link-support-email"
            >
              customersupport@autoninja.com
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
