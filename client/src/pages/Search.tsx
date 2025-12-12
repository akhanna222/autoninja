import { useState } from "react";
import { Link } from "wouter";
import { mockCars } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { ShieldCheck, MapPin, Grid, List, SlidersHorizontal } from "lucide-react";
import TrustBadge from "@/components/ui/TrustBadge";
import { cn } from "@/lib/utils";

export default function Search() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Search Results</h1>
            <p className="text-muted-foreground">Showing {mockCars.length} verified listings</p>
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
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 font-bold mb-6 text-lg">
                <SlidersHorizontal className="w-5 h-5" /> Filters
              </div>
              
              <div className="space-y-6">
                {/* Make & Model */}
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Any Make" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Makes</SelectItem>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="tesla">Tesla</SelectItem>
                      <SelectItem value="vw">Volkswagen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <Label>Price Range (€0 - €100k+)</Label>
                  <Slider defaultValue={[0, 100]} max={100} step={1} className="py-4" />
                </div>

                {/* Verification Level */}
                <div className="space-y-3">
                  <Label>Verification Level</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="verified" checked />
                      <Label htmlFor="verified" className="font-normal">Verified Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="logbook" />
                      <Label htmlFor="logbook" className="font-normal">Logbook Verified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mileage" />
                      <Label htmlFor="mileage" className="font-normal">Mileage Proven</Label>
                    </div>
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <Label>Year (Min)</Label>
                  <Input type="number" placeholder="e.g. 2018" />
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className={cn(
            "lg:col-span-3 grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {mockCars.map((car) => (
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
                        <TrustBadge type="logbook" verified={car.badges.logbookVerified} showLabel={true} />
                        <TrustBadge type="mileage" verified={car.badges.mileageVerified} showLabel={viewMode === "list"} />
                        <TrustBadge type="photos" verified={car.badges.photosVerified} showLabel={viewMode === "list"} />
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
    </div>
  );
}
