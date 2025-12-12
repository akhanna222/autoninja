import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Car, Truck, Bike, CheckCircle2, FileText, Loader2, X, ShieldCheck, Plus, Search, ArrowLeft, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/ui/AuthModal";
import { useLocation } from "wouter";
import { 
  CAR_FEATURES, IRISH_COUNTIES, CAR_MAKES, BODY_TYPES, FUEL_TYPES, 
  TRANSMISSIONS, ENGINE_SIZES, COLORS, TAX_BANDS, DOOR_OPTIONS, SEAT_OPTIONS 
} from "@/lib/carFeatures";

type VehicleType = "Car" | "Van" | "Bike" | "Truck";

interface CarFormData {
  vehicleType: VehicleType;
  registration: string;
  mileage: number;
  mileageUnit: string;
  make: string;
  model: string;
  derivative: string;
  year: number;
  nctExpiry: string;
  nctExpired: boolean;
  taxBand: string;
  owners: number;
  bodyType: string;
  transmission: string;
  fuelType: string;
  engineSize: string;
  color: string;
  numberOfDoors: number;
  numberOfSeats: number;
  features: string[];
  description: string;
  price: number;
  location: string;
  county: string;
  sellerName: string;
  email: string;
  phone: string;
  displayPhone: boolean;
  allowEmailContact: boolean;
}

export default function Sell() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [featureSearch, setFeatureSearch] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState<CarFormData>({
    vehicleType: "Car",
    registration: "",
    mileage: 0,
    mileageUnit: "km",
    make: "",
    model: "",
    derivative: "",
    year: new Date().getFullYear(),
    nctExpiry: "",
    nctExpired: false,
    taxBand: "",
    owners: 1,
    bodyType: "Saloon",
    transmission: "Automatic",
    fuelType: "Diesel",
    engineSize: "2.0",
    color: "Grey",
    numberOfDoors: 4,
    numberOfSeats: 5,
    features: [],
    description: "",
    price: 0,
    location: "",
    county: "",
    sellerName: "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    displayPhone: false,
    allowEmailContact: true,
  });

  const [createdCarId, setCreatedCarId] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;
  const stepLabels = ["Vehicle Details", "Price & Contact", "Photos", "Package & Add-ons", "Payment"];

  const updateFormData = (updates: Partial<CarFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const filteredFeatures = CAR_FEATURES.filter(f => 
    f.toLowerCase().includes(featureSearch.toLowerCase())
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (files.length + images.length > 20) {
      toast({ title: "Too many images", description: "Maximum 20 images allowed", variant: "destructive" });
      return;
    }

    // Validate file sizes and types
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please compress it first.`,
          variant: "destructive"
        });
        return;
      }

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format. Use JPEG, PNG, or WebP.`,
          variant: "destructive"
        });
        return;
      }
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: `Failed to read ${file.name}`,
          variant: "destructive"
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const createCarMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/cars", data);
      return res.json();
    },
    onSuccess: (car) => {
      setCreatedCarId(car.id);
      toast({ title: "Listing Created", description: "Now add photos to complete your listing" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create listing. Please try again.", variant: "destructive" });
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: async ({ carId, files }: { carId: number; files: File[] }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const res = await fetch(`/api/cars/${carId}/images`, { method: "POST", credentials: "include", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Photos Uploaded", description: "Your car photos have been uploaded successfully" });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ priceId, carId }: { priceId: string; carId?: number }) => {
      const res = await apiRequest("POST", "/api/stripe/checkout", { priceId, carId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start checkout. Please try again.", variant: "destructive" });
    },
  });

  const handleNext = async () => {
    if (step === 1) {
      // Validate required fields
      if (!formData.make || !formData.model || !formData.year || !formData.mileage) {
        toast({ title: "Missing Information", description: "Please fill in all required fields (Make, Model, Year, Mileage)", variant: "destructive" });
        return;
      }

      // Validate data types
      if (formData.mileage <= 0) {
        toast({ title: "Invalid Mileage", description: "Mileage must be greater than 0", variant: "destructive" });
        return;
      }

      if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
        toast({ title: "Invalid Year", description: "Please enter a valid year", variant: "destructive" });
        return;
      }

      setStep(2);
    } else if (step === 2) {
      // Validate step 2 fields
      if (!formData.price || !formData.county || !formData.email) {
        toast({ title: "Missing Information", description: "Please fill in price, county, and email", variant: "destructive" });
        return;
      }

      if (formData.price <= 0) {
        toast({ title: "Invalid Price", description: "Price must be greater than 0", variant: "destructive" });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({ title: "Invalid Email", description: "Please enter a valid email address", variant: "destructive" });
        return;
      }

      if (!user) {
        setShowAuthModal(true);
        return;
      }

      // Create the car listing
      setIsLoading(true);
      try {
        const carData = {
          ...formData,
          location: formData.county,
          sellerId: user.id,
        };
        await createCarMutation.mutateAsync(carData);
        setStep(3);
      } catch (err: any) {
        toast({
          title: "Error Creating Listing",
          description: err?.message || "Failed to create listing. Please try again.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    } else if (step === 3) {
      // Upload images if any
      if (createdCarId && images.length > 0) {
        setIsLoading(true);
        try {
          await uploadImagesMutation.mutateAsync({ carId: createdCarId, files: images });
        } catch (err: any) {
          toast({
            title: "Error Uploading Images",
            description: err?.message || "Some images failed to upload",
            variant: "destructive"
          });
        }
        setIsLoading(false);
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const vehicleTypeIcons: Record<VehicleType, React.ReactNode> = {
    Car: <Car className="w-8 h-8" />,
    Van: <Truck className="w-8 h-8" />,
    Bike: <Bike className="w-8 h-8" />,
    Truck: <Truck className="w-8 h-8" />,
  };

  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container max-w-3xl mx-auto px-4">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {stepLabels.map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                  step > idx + 1 ? "bg-green-500 border-green-500 text-white" :
                  step === idx + 1 ? "bg-accent border-accent text-white" :
                  "border-muted-foreground/30 text-muted-foreground"
                }`}>
                  {step > idx + 1 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < stepLabels.length - 1 && (
                  <div className={`hidden sm:block w-16 lg:w-24 h-0.5 mx-2 ${step > idx + 1 ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:flex justify-between text-xs text-muted-foreground">
            {stepLabels.map((label, idx) => (
              <span key={label} className={step === idx + 1 ? "text-primary font-medium" : ""}>{label}</span>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Vehicle Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 md:p-8">
                <h1 className="text-2xl font-heading font-bold mb-2">Tell us about the vehicle you are selling</h1>
                
                {/* Vehicle Type */}
                <div className="mb-6">
                  <Label className="mb-3 block">Vehicle type</Label>
                  <div className="flex gap-4">
                    {(["Car", "Van", "Bike", "Truck"] as VehicleType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => updateFormData({ vehicleType: type })}
                        className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                          formData.vehicleType === type ? "border-accent bg-accent/5" : "border-muted hover:border-muted-foreground/50"
                        }`}
                        data-testid={`vehicle-type-${type.toLowerCase()}`}
                      >
                        {vehicleTypeIcons[type]}
                        <span className="text-sm mt-2">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Registration & Mileage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label>Registration *</Label>
                    <div className="flex mt-1">
                      <div className="flex items-center px-3 bg-blue-600 text-white rounded-l-md text-xs font-bold">
                        <span>IR/GB</span>
                      </div>
                      <Input 
                        placeholder="191D12345"
                        value={formData.registration}
                        onChange={(e) => updateFormData({ registration: e.target.value.toUpperCase() })}
                        className="rounded-l-none uppercase font-mono"
                        data-testid="input-registration"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Mileage *</Label>
                    <div className="flex mt-1">
                      <Input 
                        type="number"
                        placeholder="50000"
                        value={formData.mileage || ""}
                        onChange={(e) => updateFormData({ mileage: parseInt(e.target.value) || 0 })}
                        className="rounded-r-none"
                        data-testid="input-mileage"
                      />
                      <Select value={formData.mileageUnit} onValueChange={(v) => updateFormData({ mileageUnit: v })}>
                        <SelectTrigger className="w-20 rounded-l-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">km</SelectItem>
                          <SelectItem value="miles">miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Make & Model */}
                <div className="bg-muted/30 rounded-xl p-6 space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Make *</Label>
                      <Select value={formData.make} onValueChange={(v) => updateFormData({ make: v })}>
                        <SelectTrigger data-testid="select-make"><SelectValue placeholder="Select make" /></SelectTrigger>
                        <SelectContent>
                          {CAR_MAKES.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Model *</Label>
                      <Input 
                        placeholder="e.g. 5 Series"
                        value={formData.model}
                        onChange={(e) => updateFormData({ model: e.target.value })}
                        data-testid="input-model"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Year of registration *</Label>
                      <Select value={String(formData.year)} onValueChange={(v) => updateFormData({ year: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Derivative</Label>
                      <Input 
                        placeholder="e.g. 520d SE 4DR AUTO"
                        value={formData.derivative}
                        onChange={(e) => updateFormData({ derivative: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>NCT Expiry</Label>
                      <Input 
                        type="month"
                        value={formData.nctExpiry}
                        onChange={(e) => updateFormData({ nctExpiry: e.target.value })}
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="nctExpired" 
                          checked={formData.nctExpired}
                          onCheckedChange={(checked) => updateFormData({ nctExpired: !!checked })}
                        />
                        <Label htmlFor="nctExpired" className="text-sm">Expired/Exempt</Label>
                      </div>
                    </div>
                    <div>
                      <Label>Annual motor tax/Tax band *</Label>
                      <Select value={formData.taxBand} onValueChange={(v) => updateFormData({ taxBand: v })}>
                        <SelectTrigger><SelectValue placeholder="Select tax band" /></SelectTrigger>
                        <SelectContent>
                          {TAX_BANDS.map(band => <SelectItem key={band} value={band}>{band}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Owners</Label>
                    <Input 
                      type="number"
                      min="1"
                      value={formData.owners}
                      onChange={(e) => updateFormData({ owners: parseInt(e.target.value) || 1 })}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Body Type, Transmission, Fuel, Engine, Color, Doors, Seats */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Body type *</Label>
                      <Select value={formData.bodyType} onValueChange={(v) => updateFormData({ bodyType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BODY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Transmission *</Label>
                      <Select value={formData.transmission} onValueChange={(v) => updateFormData({ transmission: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Fuel type *</Label>
                      <Select value={formData.fuelType} onValueChange={(v) => updateFormData({ fuelType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FUEL_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Engine size (L) *</Label>
                      <Select value={formData.engineSize} onValueChange={(v) => updateFormData({ engineSize: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ENGINE_SIZES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Colour *</Label>
                      <Select value={formData.color} onValueChange={(v) => updateFormData({ color: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Number of doors *</Label>
                      <Select value={String(formData.numberOfDoors)} onValueChange={(v) => updateFormData({ numberOfDoors: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DOOR_OPTIONS.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Number of seats</Label>
                      <Select value={String(formData.numberOfSeats)} onValueChange={(v) => updateFormData({ numberOfSeats: parseInt(v) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SEAT_OPTIONS.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Label>Vehicle features</Label>
                    <Button variant="link" size="sm" onClick={() => setShowFeaturesModal(true)} className="text-accent">
                      <Plus className="w-4 h-4 mr-1" /> Add / remove features
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No features added yet</p>
                    ) : (
                      formData.features.map(f => (
                        <Badge key={f} variant="secondary" className="cursor-pointer" onClick={() => toggleFeature(f)}>
                          {f} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <Label>Description (0/3000)</Label>
                  <Textarea 
                    className="h-32 mt-1"
                    placeholder="This will appear below the overview of your vehicle. Use it to persuade buyers to read further."
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value.slice(0, 3000) })}
                    maxLength={3000}
                    data-testid="textarea-description"
                  />
                </div>

                <Button onClick={handleNext} className="w-full h-12 text-lg" data-testid="button-next-step1">
                  Continue
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Price & Contact Details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 md:p-8">
                <h1 className="text-2xl font-heading font-bold mb-6 text-center">What is your asking price?</h1>
                
                <div className="mb-8">
                  <Label>Price *</Label>
                  <div className="flex items-center mt-1">
                    <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-muted-foreground">€</span>
                    <Input 
                      type="number"
                      placeholder="25000"
                      value={formData.price || ""}
                      onChange={(e) => updateFormData({ price: parseInt(e.target.value) || 0 })}
                      className="rounded-l-none text-xl font-bold"
                      data-testid="input-price"
                    />
                  </div>
                </div>

                <h2 className="text-xl font-heading font-bold mb-4 text-center">Advert contact details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Full name *</Label>
                    <Input 
                      placeholder="Your full name"
                      value={formData.sellerName}
                      onChange={(e) => updateFormData({ sellerName: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Your name will not be displayed in the ad</p>
                  </div>

                  <div>
                    <Label>Email *</Label>
                    <Input 
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      data-testid="input-email"
                    />
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Let buyers contact me by email. (Your email will be protected)</p>
                      <div className="flex gap-2">
                        <Button 
                          variant={formData.allowEmailContact ? "default" : "outline"} 
                          size="sm"
                          onClick={() => updateFormData({ allowEmailContact: true })}
                        >Yes</Button>
                        <Button 
                          variant={!formData.allowEmailContact ? "default" : "outline"} 
                          size="sm"
                          onClick={() => updateFormData({ allowEmailContact: false })}
                        >No</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Phone number *</Label>
                    <Input 
                      type="tel"
                      placeholder="+353 87 123 4567"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      data-testid="input-phone"
                    />
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Display phone number in the advert?</p>
                      <div className="flex gap-2">
                        <Button 
                          variant={formData.displayPhone ? "default" : "outline"} 
                          size="sm"
                          onClick={() => updateFormData({ displayPhone: true })}
                        >Yes</Button>
                        <Button 
                          variant={!formData.displayPhone ? "default" : "outline"} 
                          size="sm"
                          onClick={() => updateFormData({ displayPhone: false })}
                        >No</Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>County *</Label>
                    <Select value={formData.county} onValueChange={(v) => updateFormData({ county: v })}>
                      <SelectTrigger data-testid="select-county"><SelectValue placeholder="Please select a county" /></SelectTrigger>
                      <SelectContent>
                        {IRISH_COUNTIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="ghost" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="flex-1 h-12"
                    disabled={isLoading || createCarMutation.isPending}
                    data-testid="button-next-step2"
                  >
                    {isLoading || createCarMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
                    ) : "Next"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 md:p-8">
                <h1 className="text-2xl font-heading font-bold mb-2 text-center">Add Photos</h1>
                <p className="text-muted-foreground text-center mb-6">Upload up to 20 photos. First photo will be the main image.</p>

                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="aspect-[4/3] bg-muted rounded-lg relative overflow-hidden group">
                      <img src={preview} alt={`Car photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {i === 0 && (
                        <div className="absolute bottom-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">Main</div>
                      )}
                    </div>
                  ))}
                  {imagePreviews.length < 20 && (
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="aspect-[4/3] bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-accent transition-colors cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Add Photo</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <strong>Tip:</strong> Ads with more photos get up to 5x more views. Include exterior, interior, engine, and dashboard shots.
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="flex-1 h-12"
                    disabled={isLoading || uploadImagesMutation.isPending}
                    data-testid="button-next-step3"
                  >
                    {uploadImagesMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
                    ) : "Next"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Package & Add-ons */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 md:p-8">
                <h1 className="text-2xl font-heading font-bold mb-2 text-center">Choose Your Package</h1>
                <p className="text-muted-foreground text-center mb-6">Get maximum visibility for your listing</p>

                <div className="border-2 border-accent rounded-xl p-6 mb-6 bg-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Annual Seller Membership</h3>
                      <p className="text-muted-foreground">Unlimited listings for 1 year</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent">€9.99</div>
                      <div className="text-sm text-muted-foreground">/year</div>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited car listings</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Verified seller badge</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Priority listing placement</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> WhatsApp notifications</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Trust verification badges</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="flex-1 h-12 bg-accent hover:bg-accent/90"
                    data-testid="button-next-step4"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Payment */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-heading font-bold mb-2">Complete Your Membership</h1>
                <p className="text-muted-foreground mb-6">Pay €9.99 for your annual seller membership</p>

                <div className="bg-muted/30 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="flex justify-between mb-2">
                    <span>Annual Seller Membership</span>
                    <span>€9.99</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>€9.99</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  You'll be redirected to Stripe's secure checkout to complete payment.
                </p>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button 
                    onClick={() => {
                      checkoutMutation.mutate({ 
                        priceId: "price_1SdV3M2SClcbQfzFwAslyj0H",
                        carId: createdCarId || undefined
                      });
                    }}
                    disabled={checkoutMutation.isPending}
                    className="flex-1 h-12 bg-accent hover:bg-accent/90"
                    data-testid="button-pay"
                  >
                    {checkoutMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard className="w-5 h-5 mr-2" /> Pay €9.99</>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features Modal */}
      <Dialog open={showFeaturesModal} onOpenChange={setShowFeaturesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add / Remove Features</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 gap-2">
              {filteredFeatures.map((feature) => (
                <div
                  key={feature}
                  onClick={() => toggleFeature(feature)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.features.includes(feature) 
                      ? "bg-accent/10 border-accent" 
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-sm">{feature}</span>
                  {formData.features.includes(feature) && (
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-muted-foreground">{formData.features.length} features selected</span>
            <Button onClick={() => setShowFeaturesModal(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
