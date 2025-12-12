import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCarAlertSchema, insertCarSchema } from "@shared/schema";
import { checkAndNotifyMatches } from "./alertMatcher";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User phone number update
  app.patch('/api/user/phone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      const user = await storage.updateUserPhone(userId, phoneNumber);
      res.json(user);
    } catch (error) {
      console.error("Error updating phone:", error);
      res.status(500).json({ message: "Failed to update phone number" });
    }
  });

  // Car Alert routes
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertData = insertCarAlertSchema.parse({ ...req.body, userId });
      
      const alert = await storage.createCarAlert(alertData);
      res.status(201).json(alert);
    } catch (error: any) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: error.message || "Failed to create alert" });
    }
  });

  app.delete('/api/alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertId = parseInt(req.params.id);
      
      await storage.deleteCarAlert(alertId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  app.patch('/api/alerts/:id/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const alert = await storage.toggleAlertStatus(alertId, userId, isActive);
      res.json(alert);
    } catch (error) {
      console.error("Error toggling alert:", error);
      res.status(500).json({ message: "Failed to toggle alert" });
    }
  });

  // Car routes
  app.get('/api/cars', async (req, res) => {
    try {
      const filters = {
        make: req.query.make as string | undefined,
        model: req.query.model as string | undefined,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
        fuelType: req.query.fuelType as string | undefined,
        transmission: req.query.transmission as string | undefined,
        maxMileage: req.query.maxMileage ? parseInt(req.query.maxMileage as string) : undefined,
        location: req.query.location as string | undefined,
      };
      
      const cars = await storage.getCars(filters);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get('/api/cars/:id', async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const car = await storage.getCar(carId);
      
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  app.post('/api/cars', async (req, res) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(carData);
      
      // Check if this new car matches any active alerts
      await checkAndNotifyMatches(car);
      
      res.status(201).json(car);
    } catch (error: any) {
      console.error("Error creating car:", error);
      res.status(400).json({ message: error.message || "Failed to create car" });
    }
  });

  return httpServer;
}
