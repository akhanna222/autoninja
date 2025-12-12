import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck, MapPin, Grid, List, SlidersHorizontal, Car, Truck, Bike, Loader2 } from "lucide-react";
import TrustBadge from "@/components/ui/TrustBadge";
import VoiceChatDrawer from "@/components/VoiceChatDrawer";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { mockCars } from "@/lib/mockData";

interface CarFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  maxMileage?: number;
}

export default function Search() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<CarFilters>({});
  const [chatCars, setChatCars] = useState<any[] | null>(null);

  const { data: apiCars = [], isLoading } = useQuery({
    queryKey: ['/api/cars', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      const res = await fetch(`/api/cars?${params}`);
      return res.json();
    }
  });

  // Use chat-found cars if available, otherwise API cars, fallback to mock
  const displayCars = chatCars || (apiCars.length > 0 ? apiCars : mockCars);

  const handleFiltersFromChat = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setChatCars(null); // Clear chat cars to use filtered API results
  };

  const handleCarsFromChat = (cars: any[]) => {
    setChatCars(cars);
  };

  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Search Results</h1>
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : `Showing ${displayCars.length} verified listings`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="relevance">
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest Listed</SelectItem>
                <SelectItem value="verified">Verification Score</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex bg-background rounded-lg border p-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-md", viewMode === "grid" && "bg-muted")}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 rounded-md", viewMode === "list" && "bg-muted")}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 font-bold mb-4 text-lg">
                <SlidersHorizontal className="w-5 h-5" /> Refine Search
              </div>

              {/* Vehicle Type Tabs */}
              <Tabs defaultValue="cars" className="w-full mb-6">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="cars" className="flex flex-col h-auto py-2 text-xs gap-1">
                    <Car className="w-4 h-4" /> Cars
                  </TabsTrigger>
                  <TabsTrigger value="commercials" className="flex flex-col h-auto py-2 text-xs gap-1">
                    <Truck className="w-4 h-4" /> Vans
                  </TabsTrigger>
                  <TabsTrigger value="bikes" className="flex flex-col h-auto py-2 text-xs gap-1">
                    <Bike className="w-4 h-4" /> Bikes
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4 px-1">
                 {/* Make & Model (Always visible) */}
                 <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Make</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Any Make" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Makes</SelectItem>
                          <SelectItem value="bmw">BMW</SelectItem>
                          <SelectItem value="audi">Audi</SelectItem>
                          <SelectItem value="tesla">Tesla</SelectItem>
                          <SelectItem value="vw">Volkswagen</SelectItem>
                          <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Model</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Any Model" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                 </div>

                 {/* Price Range (Always visible) */}
                 <div className="space-y-3 pt-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</Label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Min" className="h-9" />
                      <Input type="number" placeholder="Max" className="h-9" />
                    </div>
                 </div>
                 
                 {/* Special Badges */}
                 <div className="space-y-2 py-2">
                    <div className="flex items-center space-x-2 border p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox id="history" />
                      <Label htmlFor="history" className="text-sm font-medium cursor-pointer flex-1">
                        History Checked
                        <span className="block text-xs text-muted-foreground font-normal">No finance/accidents</span>
                      </Label>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-center space-x-2 border p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox id="aa" />
                      <Label htmlFor="aa" className="text-sm font-medium cursor-pointer flex-1">
                        Dealer Approved
                        <span className="block text-xs text-muted-foreground font-normal">100+ point check</span>
                      </Label>
                      <div className="w-4 h-4 bg-yellow-400 rounded-sm" />
                    </div>
                 </div>

                 {/* Collapsible Advanced Filters */}
                 <Accordion type="multiple" defaultValue={["year", "fuel"]} className="w-full">
                    <AccordionItem value="year">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Year</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-2 pt-1 pb-2">
                           <Select>
                             <SelectTrigger className="h-9"><SelectValue placeholder="From" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="2025">2025</SelectItem>
                               <SelectItem value="2024">2024</SelectItem>
                               <SelectItem value="2023">2023</SelectItem>
                               <SelectItem value="2020">2020</SelectItem>
                             </SelectContent>
                           </Select>
                           <Select>
                             <SelectTrigger className="h-9"><SelectValue placeholder="To" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="2025">2025</SelectItem>
                               <SelectItem value="2024">2024</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="body">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Body Type</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-1 pb-2">
                           <div className="flex items-center space-x-2"><Checkbox id="suv" /><Label htmlFor="suv">SUV</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="saloon" /><Label htmlFor="saloon">Saloon</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="hatch" /><Label htmlFor="hatch">Hatchback</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="estate" /><Label htmlFor="estate">Estate</Label></div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="fuel">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Fuel Type</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-1 pb-2">
                           <div className="flex items-center space-x-2"><Checkbox id="diesel" /><Label htmlFor="diesel">Diesel</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="petrol" /><Label htmlFor="petrol">Petrol</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="hybrid" /><Label htmlFor="hybrid">Hybrid</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="electric" /><Label htmlFor="electric">Electric</Label></div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="engine">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Engine Size</AccordionTrigger>
                      <AccordionContent>
                         <div className="flex gap-2 pt-1 pb-2">
                           <Select>
                             <SelectTrigger className="h-9"><SelectValue placeholder="Min (L)" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="1.0">1.0 L</SelectItem>
                               <SelectItem value="2.0">2.0 L</SelectItem>
                             </SelectContent>
                           </Select>
                           <Select>
                             <SelectTrigger className="h-9"><SelectValue placeholder="Max (L)" /></SelectTrigger>
                             <SelectContent>
                               <SelectItem value="3.0">3.0 L</SelectItem>
                               <SelectItem value="5.0">5.0 L</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="mileage">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Mileage (km)</AccordionTrigger>
                      <AccordionContent>
                         <div className="pt-2 pb-4 px-2">
                            <Slider defaultValue={[150000]} max={300000} step={5000} />
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                               <span>0 km</span>
                               <span>150,000 km</span>
                            </div>
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="transmission">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Transmission</AccordionTrigger>
                      <AccordionContent>
                         <RadioGroup defaultValue="any">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="any" id="t-any" /><Label htmlFor="t-any">Any</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="auto" id="t-auto" /><Label htmlFor="t-auto">Automatic</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="manual" id="t-manual" /><Label htmlFor="t-manual">Manual</Label></div>
                         </RadioGroup>
                      </AccordionContent>
                    </AccordionItem>

                     <AccordionItem value="color">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Colour</AccordionTrigger>
                      <AccordionContent>
                         <div className="grid grid-cols-5 gap-2 pt-1 pb-2">
                            <div className="w-6 h-6 rounded-full bg-black border cursor-pointer ring-offset-2 hover:ring-2 ring-primary"></div>
                            <div className="w-6 h-6 rounded-full bg-white border cursor-pointer ring-offset-2 hover:ring-2 ring-primary"></div>
                            <div className="w-6 h-6 rounded-full bg-gray-500 border cursor-pointer ring-offset-2 hover:ring-2 ring-primary"></div>
                            <div className="w-6 h-6 rounded-full bg-blue-600 border cursor-pointer ring-offset-2 hover:ring-2 ring-primary"></div>
                            <div className="w-6 h-6 rounded-full bg-red-600 border cursor-pointer ring-offset-2 hover:ring-2 ring-primary"></div>
                         </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                     <AccordionItem value="seller">
                      <AccordionTrigger className="py-2 text-sm font-semibold">Seller Type</AccordionTrigger>
                      <AccordionContent>
                         <div className="space-y-2 pt-1 pb-2">
                           <div className="flex items-center space-x-2"><Checkbox id="dealer" /><Label htmlFor="dealer">Trade / Dealer</Label></div>
                           <div className="flex items-center space-x-2"><Checkbox id="private" /><Label htmlFor="private">Private Seller</Label></div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                 </Accordion>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className={cn(
            "lg:col-span-3 grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : displayCars.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No cars found matching your criteria</p>
              </div>
            ) : null}
            {displayCars.map((car: any) => (
              <Link key={car.id} href={`/listing/${car.id}`}>
                <div className={cn(
                  "group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex",
                  viewMode === "grid" ? "flex-col" : "flex-row h-52"
                )}>
                  {/* Image */}
                  <div className={cn(
                    "relative overflow-hidden",
                    viewMode === "grid" ? "aspect-[16/10] w-full" : "w-1/3 h-full"
                  )}>
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

                  {/* Content */}
                  <div className={cn("p-4 flex flex-col justify-between flex-1", viewMode === "list" && "py-4")}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading font-bold text-lg truncate pr-2">{car.make} {car.model}</h3>
                        {viewMode === "list" && (
                          <div className="text-2xl font-bold text-primary">€{car.price.toLocaleString()}</div>
                        )}
                      </div>
                      
                      {viewMode === "grid" && (
                         <div className="text-2xl font-bold text-primary mb-3">€{car.price.toLocaleString()}</div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <TrustBadge type="logbook" verified={car.logbookVerified || car.badges?.logbookVerified} showLabel={true} />
                        <TrustBadge type="mileage" verified={car.mileageVerified || car.badges?.mileageVerified} showLabel={viewMode === "list"} />
                        <TrustBadge type="photos" verified={car.photosVerified || car.badges?.photosVerified} showLabel={viewMode === "list"} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3 mt-auto">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          {car.mileage.toLocaleString()} km
                        </span>
                        <span className="flex items-center gap-1">
                          {car.fuelType}
                        </span>
                        <span className="flex items-center gap-1">
                          {car.transmission}
                        </span>
                      </div>
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
      </div>

      {/* Voice Chat Assistant */}
      <VoiceChatDrawer 
        onFiltersChange={handleFiltersFromChat}
        onCarsFound={handleCarsFromChat}
      />
    </div>
  );
}
