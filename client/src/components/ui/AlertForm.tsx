import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const alertSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  maxMileage: z.number().optional(),
  location: z.string().optional(),
  notifyViaWhatsApp: z.boolean().default(true),
});

type AlertFormData = z.infer<typeof alertSchema>;

export default function AlertForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      notifyViaWhatsApp: true,
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: AlertFormData) => {
      return await apiRequest("/api/alerts", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Created",
        description: "You'll be notified when a matching car is listed.",
      });
      setOpen(false);
      reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AlertFormData) => {
    // Convert empty strings to undefined
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value === "" || value === null) {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {} as AlertFormData);
    
    createAlertMutation.mutate(cleanedData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-white gap-2">
          <Bell className="w-4 h-4" /> Create Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Create Car Alert</DialogTitle>
          <DialogDescription>
            Set your preferences and we'll notify you via WhatsApp when a matching car is listed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Make</Label>
              <Select onValueChange={(value) => setValue("make", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BMW">BMW</SelectItem>
                  <SelectItem value="Audi">Audi</SelectItem>
                  <SelectItem value="Tesla">Tesla</SelectItem>
                  <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                  <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Input {...register("model")} placeholder="e.g. 3 Series" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Price (€)</Label>
              <Input {...register("minPrice", { valueAsNumber: true })} type="number" placeholder="e.g. 10000" />
            </div>
            <div className="space-y-2">
              <Label>Max Price (€)</Label>
              <Input {...register("maxPrice", { valueAsNumber: true })} type="number" placeholder="e.g. 50000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Year</Label>
              <Input {...register("minYear", { valueAsNumber: true })} type="number" placeholder="e.g. 2018" />
            </div>
            <div className="space-y-2">
              <Label>Max Year</Label>
              <Input {...register("maxYear", { valueAsNumber: true })} type="number" placeholder="e.g. 2024" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fuel Type</Label>
              <Select onValueChange={(value) => setValue("fuelType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Fuel Type" />
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
              <Select onValueChange={(value) => setValue("transmission", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Mileage (km)</Label>
              <Input {...register("maxMileage", { valueAsNumber: true })} type="number" placeholder="e.g. 100000" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input {...register("location")} placeholder="e.g. Dublin" />
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createAlertMutation.isPending} className="flex-1 bg-accent hover:bg-accent/90 text-white">
              {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
