import { useParams } from "wouter";
import { mockCars } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, MapPin, Calendar, Gauge, Fuel, Cog, 
  CheckCircle2, AlertTriangle, FileCheck, Camera 
} from "lucide-react";
import { cn } from "@/lib/utils";
import TrustBadge from "@/components/ui/TrustBadge";
import NotFound from "./not-found";

export default function Listing() {
  const { id } = useParams();
  const car = mockCars.find(c => c.id === id);

  if (!car) return <NotFound />;

  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Home / Cars / {car.make} / {car.model}</div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary flex items-center gap-3">
                {car.year} {car.make} {car.model}
                {car.verificationScore > 90 && (
                  <Badge className="bg-accent text-white border-0 text-sm px-3 py-1">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                  </Badge>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" /> {car.location} • Posted 2 days ago
              </div>
            </div>
            <div className="text-right">
               <h2 className="text-4xl font-bold text-primary">€{car.price.toLocaleString()}</h2>
               <p className="text-sm text-green-600 font-medium">Fair Market Price</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Images & Key Specs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm aspect-video relative group">
              <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black backdrop-blur">
                    <Camera className="w-4 h-4 mr-2" /> View 12 Photos
                 </Button>
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { icon: Calendar, label: "Year", value: car.year },
                 { icon: Gauge, label: "Mileage", value: `${car.mileage.toLocaleString()} km` },
                 { icon: Fuel, label: "Fuel", value: car.fuelType },
                 { icon: Cog, label: "Gearbox", value: car.transmission },
               ].map((spec, i) => (
                 <Card key={i} className="p-4 flex flex-col items-center text-center justify-center hover:border-accent/30 transition-colors">
                    <spec.icon className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{spec.label}</span>
                    <span className="font-bold text-lg">{spec.value}</span>
                 </Card>
               ))}
            </div>

            {/* Description */}
            <Card className="p-6">
              <h3 className="font-heading font-bold text-xl mb-4">Vehicle Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                Stunning {car.make} {car.model} in excellent condition. 
                Full service history available. Recently serviced and NCT passed. 
                Features include leather seats, navigation, parking sensors, and more. 
                This car has been verified by our AI system for mileage and ownership authenticity.
              </p>
            </Card>
          </div>

          {/* Right Column: Digital Passport & Seller */}
          <div className="space-y-6">
            
            {/* Digital Passport Card */}
            <Card className="p-6 border-accent/20 bg-accent/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-32 h-32 text-accent" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" /> 
                    Digital Health Passport
                  </h3>
                  <span className="text-2xl font-bold text-accent">{car.verificationScore}/100</span>
                </div>

                <div className="space-y-4">
                  {/* Logbook */}
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 rounded-full p-1", car.badges.logbookVerified ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                      {car.badges.logbookVerified ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Logbook (VRC) Verified</div>
                      <div className="text-xs text-muted-foreground">Ownership & VIN match official records</div>
                    </div>
                  </div>

                  {/* Mileage */}
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 rounded-full p-1", car.badges.mileageVerified ? "bg-emerald-100 text-emerald-600" : "bg-yellow-100 text-yellow-600")}>
                      {car.badges.mileageVerified ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Mileage Consistency</div>
                      <div className="text-xs text-muted-foreground">Odometer photo matches history curve</div>
                    </div>
                  </div>

                  {/* Finance */}
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 rounded-full p-1", !car.history.finance ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                      {!car.history.finance ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Finance Check</div>
                      <div className="text-xs text-muted-foreground">{!car.history.finance ? "No outstanding finance detected" : "Outstanding finance flagged"}</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6 bg-accent/20" />
                
                <Button className="w-full bg-accent hover:bg-accent/90 text-white font-semibold">
                  View Full History Report
                </Button>
              </div>
            </Card>

            {/* Seller Info */}
            <Card className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Seller Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  JD
                </div>
                <div>
                  <div className="font-bold">John Doe</div>
                  <div className="text-xs text-muted-foreground">Private Seller • Verified Identity</div>
                  <div className="flex gap-1 mt-1">
                     <span className="text-xs bg-muted px-2 py-0.5 rounded">Joined 2021</span>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-3">
                <Button size="lg" className="w-full font-bold">Contact Seller</Button>
                <Button variant="outline" size="lg" className="w-full">Make an Offer</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
