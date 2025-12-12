import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Trash2, Edit2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import AlertForm from "@/components/ui/AlertForm";
import { useState } from "react";

export default function MyAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const updatePhoneMutation = useMutation({
    mutationFn: async (phone: string) => {
      return await apiRequest("/api/user/phone", {
        method: "PATCH",
        body: JSON.stringify({ phoneNumber: phone }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Phone Updated",
        description: "Your WhatsApp number has been saved.",
      });
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
        description: "Failed to update phone number.",
        variant: "destructive",
      });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      return await apiRequest(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Deleted",
        description: "Your alert has been removed.",
      });
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
        description: "Failed to delete alert.",
        variant: "destructive",
      });
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return await apiRequest(`/api/alerts/${id}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
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
        description: "Failed to toggle alert.",
        variant: "destructive",
      });
    },
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePhoneMutation.mutate(phoneNumber);
  };

  return (
    <div className="min-h-screen bg-muted/10 pt-24 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">My Car Alerts</h1>
            <p className="text-muted-foreground">Get notified instantly when your dream car is listed</p>
          </div>
          <AlertForm />
        </div>

        {/* WhatsApp Number Section */}
        {!user?.phoneNumber && (
          <Card className="p-6 mb-8 bg-accent/5 border-accent/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Add Your WhatsApp Number</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To receive instant WhatsApp notifications, please add your phone number (with country code).
                </p>
                <form onSubmit={handlePhoneSubmit} className="flex gap-2">
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+353 87 123 4567"
                    className="max-w-xs"
                  />
                  <Button type="submit" disabled={updatePhoneMutation.isPending} className="bg-accent hover:bg-accent/90 text-white">
                    {updatePhoneMutation.isPending ? "Saving..." : "Save Number"}
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        )}

        {/* Alerts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No alerts yet</h3>
            <p className="text-muted-foreground mb-6">Create your first alert to start receiving notifications</p>
            <AlertForm />
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any) => (
              <Card key={alert.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {alert.make || "Any Make"} {alert.model || ""}
                      </h3>
                      {alert.isActive ? (
                        <Badge className="bg-accent text-white">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Paused</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {alert.minPrice && <span>Min: €{alert.minPrice.toLocaleString()}</span>}
                      {alert.maxPrice && <span>Max: €{alert.maxPrice.toLocaleString()}</span>}
                      {alert.minYear && <span>From: {alert.minYear}</span>}
                      {alert.maxYear && <span>To: {alert.maxYear}</span>}
                      {alert.fuelType && <span>{alert.fuelType}</span>}
                      {alert.transmission && <span>{alert.transmission}</span>}
                      {alert.maxMileage && <span>Max {alert.maxMileage.toLocaleString()} km</span>}
                      {alert.location && <span>{alert.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={(checked) =>
                        toggleAlertMutation.mutate({ id: alert.id, isActive: checked })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
