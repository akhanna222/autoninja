import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Car, CheckCircle2, FileText, Loader2, Upload, X, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/ui/AuthModal";
import { useLocation } from "wouter";

export default function Sell() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Car data
  const [carData, setCarData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    location: "",
    fuelType: "Petrol",
    transmission: "Manual",
    description: "",
    bodyType: "Sedan",
    color: "",
    condition: "Excellent",
  });
  const [createdCarId, setCreatedCarId] = useState<number | null>(null);
  
  // File uploads
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [logbook, setLogbook] = useState<File | null>(null);
  const [odometerPhoto, setOdometerPhoto] = useState<File | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logbookInputRef = useRef<HTMLInputElement>(null);
  const odometerInputRef = useRef<HTMLInputElement>(null);

  const createCarMutation = useMutation({
    mutationFn: async (data: typeof carData) => {
      const res = await apiRequest("POST", "/api/cars", data);
      return res.json();
    },
    onSuccess: (car) => {
      setCreatedCarId(car.id);
      setStep(2);
      toast({
        title: "Listing Started",
        description: "Now let's add verification documents",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: async ({ carId, files }: { carId: number; files: File[] }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      
      const res = await fetch(`/api/cars/${carId}/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Photos Uploaded",
        description: "Your car photos have been uploaded successfully",
      });
      setStep(4);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ carId, file, docType }: { carId: number; file: File; docType: string }) => {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("docType", docType);
      
      const res = await fetch(`/api/cars/${carId}/documents`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Document Uploaded",
        description: `${variables.docType === 'logbook' ? 'Logbook' : 'Odometer photo'} verified successfully`,
      });
    },
  });

  const handleStartListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!carData.make || !carData.model) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    createCarMutation.mutate(carData);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images allowed",
        variant: "destructive",
      });
      return;
    }
    
    const newImages = [...images, ...files];
    setImages(newImages);
    
    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (step === 2) {
      // Upload documents if provided
      if (createdCarId) {
        if (logbook) {
          await uploadDocumentMutation.mutateAsync({ carId: createdCarId, file: logbook, docType: 'logbook' });
        }
        if (odometerPhoto) {
          await uploadDocumentMutation.mutateAsync({ carId: createdCarId, file: odometerPhoto, docType: 'odometer' });
        }
      }
      setStep(3);
    } else if (step === 3) {
      if (createdCarId && images.length > 0) {
        uploadImagesMutation.mutate({ carId: createdCarId, files: images });
      } else {
        setStep(4);
      }
    }
  };

  const handlePublish = () => {
    toast({
      title: "Listing Published!",
      description: "Your car is now live on AutoNinja",
    });
    setLocation("/search");
  };

  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container max-w-2xl mx-auto px-4">
        
        {/* Progress */}
        <div className="mb-8">
           <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
             <span className={step >= 1 ? "text-primary" : ""}>1. Details</span>
             <span className={step >= 2 ? "text-primary" : ""}>2. Verification</span>
             <span className={step >= 3 ? "text-primary" : ""}>3. Photos</span>
             <span className={step >= 4 ? "text-primary" : ""}>4. Price</span>
           </div>
           <div className="h-2 bg-muted rounded-full overflow-hidden">
             <div 
               className="h-full bg-accent transition-all duration-500 ease-out"
               style={{ width: `${(step / 4) * 100}%` }} 
             />
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-heading font-bold mb-2">Sell Your Car</h1>
                  <p className="text-muted-foreground">Enter your car details to get started</p>
                </div>

                <form onSubmit={handleStartListing} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Make *</Label>
                      <Select value={carData.make} onValueChange={(v) => setCarData({ ...carData, make: v })}>
                        <SelectTrigger data-testid="select-make">
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Toyota">Toyota</SelectItem>
                          <SelectItem value="Honda">Honda</SelectItem>
                          <SelectItem value="BMW">BMW</SelectItem>
                          <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                          <SelectItem value="Audi">Audi</SelectItem>
                          <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                          <SelectItem value="Ford">Ford</SelectItem>
                          <SelectItem value="Nissan">Nissan</SelectItem>
                          <SelectItem value="Mazda">Mazda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Model *</Label>
                      <Input 
                        placeholder="e.g. Camry"
                        value={carData.model}
                        onChange={(e) => setCarData({ ...carData, model: e.target.value })}
                        data-testid="input-model"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Year *</Label>
                      <Select value={String(carData.year)} onValueChange={(v) => setCarData({ ...carData, year: parseInt(v) })}>
                        <SelectTrigger data-testid="select-year">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mileage (km) *</Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 50000"
                        value={carData.mileage || ""}
                        onChange={(e) => setCarData({ ...carData, mileage: parseInt(e.target.value) || 0 })}
                        data-testid="input-mileage"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fuel Type</Label>
                      <Select value={carData.fuelType} onValueChange={(v) => setCarData({ ...carData, fuelType: v })}>
                        <SelectTrigger data-testid="select-fuel">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Transmission</Label>
                      <Select value={carData.transmission} onValueChange={(v) => setCarData({ ...carData, transmission: v })}>
                        <SelectTrigger data-testid="select-transmission">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Automatic">Automatic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input 
                      placeholder="e.g. Dublin"
                      value={carData.location}
                      onChange={(e) => setCarData({ ...carData, location: e.target.value })}
                      data-testid="input-location"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg" 
                    disabled={createCarMutation.isPending}
                    data-testid="button-start-listing"
                  >
                    {createCarMutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating Listing...</>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                 <div className="text-center mb-6">
                    <h2 className="text-xl font-heading font-bold">Smart Verification</h2>
                    <p className="text-muted-foreground">Upload these items to get the "Verified" badge and sell 3x faster.</p>
                 </div>

                 <div className="space-y-4">
                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 hover:bg-muted/30 transition-colors cursor-pointer text-center ${logbook ? 'border-green-500 bg-green-50' : 'border-muted-foreground/20'}`}
                      onClick={() => logbookInputRef.current?.click()}
                    >
                       <input
                         type="file"
                         ref={logbookInputRef}
                         className="hidden"
                         accept="image/*,.pdf"
                         onChange={(e) => setLogbook(e.target.files?.[0] || null)}
                       />
                       {logbook ? (
                         <>
                           <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                           <h3 className="font-semibold mb-1 text-green-700">Logbook Uploaded</h3>
                           <p className="text-xs text-green-600">{logbook.name}</p>
                         </>
                       ) : (
                         <>
                           <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
                           <h3 className="font-semibold mb-1">Logbook (VRC)</h3>
                           <p className="text-xs text-muted-foreground">Upload a photo of your vehicle registration cert.</p>
                           <Button variant="outline" size="sm" className="mt-4" data-testid="button-upload-logbook">Upload VRC</Button>
                         </>
                       )}
                    </div>

                    <div 
                      className={`border-2 border-dashed rounded-xl p-6 hover:bg-muted/30 transition-colors cursor-pointer text-center ${odometerPhoto ? 'border-green-500 bg-green-50' : 'border-muted-foreground/20'}`}
                      onClick={() => odometerInputRef.current?.click()}
                    >
                       <input
                         type="file"
                         ref={odometerInputRef}
                         className="hidden"
                         accept="image/*"
                         onChange={(e) => setOdometerPhoto(e.target.files?.[0] || null)}
                       />
                       {odometerPhoto ? (
                         <>
                           <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
                           <h3 className="font-semibold mb-1 text-green-700">Odometer Verified</h3>
                           <p className="text-xs text-green-600">{odometerPhoto.name}</p>
                         </>
                       ) : (
                         <>
                           <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                             <span className="font-bold text-xs">123</span>
                           </div>
                           <h3 className="font-semibold mb-1">Odometer Reading</h3>
                           <p className="text-xs text-muted-foreground">Take a photo of your dashboard showing current mileage.</p>
                           <Button variant="outline" size="sm" className="mt-4" data-testid="button-upload-odometer">Camera Capture</Button>
                         </>
                       )}
                    </div>
                 </div>

                 <Button 
                   onClick={handleNext} 
                   className="w-full mt-8"
                   disabled={uploadDocumentMutation.isPending}
                   data-testid="button-continue-step2"
                 >
                   {uploadDocumentMutation.isPending ? (
                     <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
                   ) : (
                     "Continue"
                   )}
                 </Button>
                 <Button variant="ghost" onClick={() => setStep(3)} className="w-full mt-2 text-muted-foreground">Skip for now (Lower visibility)</Button>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                 <div className="text-center mb-6">
                    <h2 className="text-xl font-heading font-bold">Vehicle Photos</h2>
                    <p className="text-muted-foreground">Add up to 10 photos. First photo will be the main image.</p>
                 </div>

                 <input
                   type="file"
                   ref={imageInputRef}
                   className="hidden"
                   accept="image/*"
                   multiple
                   onChange={handleImageSelect}
                 />

                 <div className="grid grid-cols-2 gap-4 mb-6">
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
                          <div className="absolute bottom-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}
                    {imagePreviews.length < 10 && (
                      <div 
                        onClick={() => imageInputRef.current?.click()}
                        className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-accent transition-colors cursor-pointer"
                      >
                        <div className="text-center">
                          <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Add Photo</span>
                        </div>
                      </div>
                    )}
                 </div>
                 
                 <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex gap-2 items-start">
                   <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                   <div>
                     <strong>AI Tip:</strong> Take photos in landscape mode. Include exterior, interior, and dashboard shots.
                   </div>
                 </div>

                 <Button 
                   onClick={handleNext} 
                   className="w-full mt-8"
                   disabled={uploadImagesMutation.isPending}
                   data-testid="button-continue-step3"
                 >
                   {uploadImagesMutation.isPending ? (
                     <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading Photos...</>
                   ) : (
                     "Continue"
                   )}
                 </Button>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
             >
               <Card className="p-8">
                 <div className="text-center mb-6">
                    <h2 className="text-xl font-heading font-bold">Final Details</h2>
                    <p className="text-muted-foreground">Set your price and add a description.</p>
                 </div>

                 <div className="space-y-4">
                   <div>
                     <Label>Price (€) *</Label>
                     <Input 
                       type="number" 
                       value={carData.price || ""}
                       onChange={(e) => setCarData({ ...carData, price: parseInt(e.target.value) || 0 })}
                       className="text-lg font-bold"
                       placeholder="e.g. 25000"
                       data-testid="input-price"
                     />
                   </div>
                   
                   <div>
                     <Label>Description</Label>
                     <Textarea 
                       className="h-32" 
                       placeholder="Tell buyers about your car..."
                       value={carData.description}
                       onChange={(e) => setCarData({ ...carData, description: e.target.value })}
                       data-testid="textarea-description"
                     />
                   </div>
                 </div>

                 <Button 
                   onClick={handlePublish}
                   className="w-full mt-8 bg-accent hover:bg-accent/90 text-white text-lg h-12"
                   data-testid="button-publish"
                 >
                   Publish Listing
                 </Button>
               </Card>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}
