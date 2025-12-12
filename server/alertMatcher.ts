import { storage } from "./storage";
import { sendWhatsAppNotification } from "./twilio";
import type { Car, CarAlert } from "@shared/schema";

export function carMatchesAlert(car: Car, alert: CarAlert): boolean {
  // Check make
  if (alert.make && car.make !== alert.make) return false;
  
  // Check model
  if (alert.model && car.model !== alert.model) return false;
  
  // Check price range
  if (alert.minPrice && car.price < alert.minPrice) return false;
  if (alert.maxPrice && car.price > alert.maxPrice) return false;
  
  // Check year range
  if (alert.minYear && car.year < alert.minYear) return false;
  if (alert.maxYear && car.year > alert.maxYear) return false;
  
  // Check fuel type
  if (alert.fuelType && car.fuelType !== alert.fuelType) return false;
  
  // Check transmission
  if (alert.transmission && car.transmission !== alert.transmission) return false;
  
  // Check mileage
  if (alert.maxMileage && car.mileage > alert.maxMileage) return false;
  
  // Check location
  if (alert.location && car.location !== alert.location) return false;
  
  return true;
}

export async function checkAndNotifyMatches(car: Car) {
  try {
    const activeAlerts = await storage.getActiveAlerts();
    
    for (const alert of activeAlerts) {
      if (carMatchesAlert(car, alert)) {
        // Get user to check if they have a phone number
        const user = await storage.getUser(alert.userId);
        
        if (user && user.phoneNumber && alert.notifyViaWhatsApp) {
          const message = `🚗 New Car Alert!\n\n${car.year} ${car.make} ${car.model}\n💰 Price: €${car.price.toLocaleString()}\n📍 Location: ${car.location}\n🔢 Mileage: ${car.mileage.toLocaleString()} km\n\nView it now on Carzone!`;
          
          try {
            await sendWhatsAppNotification(user.phoneNumber, message);
            console.log(`Alert sent to user ${user.id} for car ${car.id}`);
          } catch (error) {
            console.error(`Failed to send WhatsApp to user ${user.id}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking alert matches:', error);
  }
}
