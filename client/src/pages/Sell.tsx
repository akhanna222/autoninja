import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Car, CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Sell() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    // Simulate AI Lookup
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(2);
      toast({
        title: "Vehicle Found",
        description: "2019 BMW 5 Series (520d) verified.",
      });
    }, 1500);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container max-w-2xl mx-auto px-4">
        
        {/* Progress */}
        <div className="mb-8">
           <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
             <span className={step >= 1 ? "text-primary" : ""}>1. Registration</span>
             <span className={step >= 2 ? "text-primary" : ""}>2. Verification</span>
             <span className={step >= 3 ? "text-primary" : ""}>3. Photos</span>
             <span className={step >= 4 ? "text-primary" : ""}>4. Details</span>
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
                  <p className="text-muted-foreground">Enter your registration number to get started. We'll auto-fill the details.</p>
                </div>

                <form onSubmit={handleRegSubmit} className="max-w-xs mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label>Registration Number</Label>
                    <Input 
                      placeholder="e.g. 191-D-12345" 
                      className="text-center text-xl uppercase font-mono tracking-wider h-14"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg" disabled={isAnalyzing}>
                    {isAnalyzing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</> : "Start Listing"}
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
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 hover:bg-muted/30 transition-colors cursor-pointer text-center">
                       <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
                       <h3 className="font-semibold mb-1">Logbook (VRC)</h3>
                       <p className="text-xs text-muted-foreground">Upload a photo of your vehicle registration cert.</p>
                       <Button variant="outline" size="sm" className="mt-4">Upload VRC</Button>
                    </div>

                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 hover:bg-muted/30 transition-colors cursor-pointer text-center">
                       <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                         <span className="font-bold text-xs">123</span>
                       </div>
                       <h3 className="font-semibold mb-1">Odometer Reading</h3>
                       <p className="text-xs text-muted-foreground">Take a photo of your dashboard showing current mileage.</p>
                       <Button variant="outline" size="sm" className="mt-4">Camera Capture</Button>
                    </div>
                 </div>

                 <Button onClick={handleNext} className="w-full mt-8">Continue</Button>
                 <Button variant="ghost" onClick={handleNext} className="w-full mt-2 text-muted-foreground">Skip for now (Lower visibility)</Button>
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
                    <p className="text-muted-foreground">Our AI will check for best angles and verify timestamps.</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center border hover:border-accent transition-colors cursor-pointer">
                        <div className="text-center">
                          <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Add Photo</span>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex gap-2 items-start">
                   <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                   <div>
                     <strong>AI Tip:</strong> Take photos in landscape mode. Avoid direct sunlight glare on the dashboard.
                   </div>
                 </div>

                 <Button onClick={handleNext} className="w-full mt-8">Continue</Button>
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
                    <p className="text-muted-foreground">Review and set your price.</p>
                 </div>

                 <div className="space-y-4">
                   <div>
                     <Label>Price (€)</Label>
                     <Input type="number" defaultValue={24500} className="text-lg font-bold" />
                     <p className="text-xs text-green-600 mt-1">Recommended range: €23,000 - €25,500</p>
                   </div>
                   
                   <div>
                     <Label>Description</Label>
                     <Textarea className="h-32" placeholder="Tell buyers about your car..." />
                     <Button variant="ghost" size="sm" className="mt-1 h-auto py-1 px-2 text-xs text-accent">
                       ✨ AI Rewrite (Professional)
                     </Button>
                   </div>
                 </div>

                 <Button className="w-full mt-8 bg-accent hover:bg-accent/90 text-white text-lg h-12">Publish Listing</Button>
               </Card>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
