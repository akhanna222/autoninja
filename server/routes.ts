import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertCarAlertSchema, insertCarSchema } from "@shared/schema";
import { checkAndNotifyMatches } from "./alertMatcher";
import { processCarSearchChat, type CarSearchFilters } from "./openai";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.fieldname === 'images' ? 'images' : 'documents';
    const dir = `${uploadDir}/${type}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files allowed'));
      }
    } else {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and image files allowed for documents'));
      }
    }
  }
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // User phone number update
  app.patch('/api/user/phone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
      const userId = req.session.userId;
      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
      const userId = req.session.userId;
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
        bodyType: req.query.bodyType as string | undefined,
        color: req.query.color as string | undefined,
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

  // Get user's listed cars
  app.get('/api/my-cars', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const cars = await storage.getUserCars(userId);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching user cars:", error);
      res.status(500).json({ message: "Failed to fetch your cars" });
    }
  });

  app.post('/api/cars', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const carData = insertCarSchema.parse({ ...req.body, sellerId: userId });
      const car = await storage.createCar(carData);
      
      // Check if this new car matches any active alerts
      await checkAndNotifyMatches(car);
      
      res.status(201).json(car);
    } catch (error: any) {
      console.error("Error creating car:", error);
      res.status(400).json({ message: error.message || "Failed to create car" });
    }
  });

  app.put('/api/cars/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const carId = parseInt(req.params.id);
      const car = await storage.updateCar(carId, userId, req.body);
      res.json(car);
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({ message: "Failed to update car" });
    }
  });

  app.delete('/api/cars/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const carId = parseInt(req.params.id);
      await storage.deleteCar(carId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting car:", error);
      res.status(500).json({ message: "Failed to delete car" });
    }
  });

  // Car Images routes
  app.get('/api/cars/:id/images', async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const images = await storage.getCarImages(carId);
      res.json(images);
    } catch (error) {
      console.error("Error fetching car images:", error);
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  app.post('/api/cars/:id/images', isAuthenticated, upload.array('images', 10), async (req: any, res) => {
    try {
      const carId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Verify car ownership
      const car = await storage.getCar(carId);
      if (!car || car.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const files = req.files as Express.Multer.File[];
      const images = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = `/uploads/images/${file.filename}`;
        const isPrimary = i === 0 && (await storage.getCarImages(carId)).length === 0;
        
        const image = await storage.addCarImage({
          carId,
          imageUrl,
          isPrimary,
        });
        images.push(image);

        // Update car's primary image if this is the first
        if (isPrimary) {
          await storage.updateCar(carId, userId, { imageUrl });
        }
      }

      res.status(201).json(images);
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  app.delete('/api/cars/:carId/images/:imageId', isAuthenticated, async (req: any, res) => {
    try {
      const carId = parseInt(req.params.carId);
      const imageId = parseInt(req.params.imageId);
      const userId = req.session.userId;

      // Verify car ownership
      const car = await storage.getCar(carId);
      if (!car || car.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteCarImage(imageId, carId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Car Documents routes (logbook, etc.)
  app.get('/api/cars/:id/documents', async (req, res) => {
    try {
      const carId = parseInt(req.params.id);
      const documents = await storage.getCarDocuments(carId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/cars/:id/documents', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      const carId = parseInt(req.params.id);
      const userId = req.session.userId;
      const { docType } = req.body;

      // Verify car ownership
      const car = await storage.getCar(carId);
      if (!car || car.sellerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const file = req.file as Express.Multer.File;
      const fileUrl = `/uploads/documents/${file.filename}`;

      const document = await storage.addCarDocument({
        carId,
        userId,
        docType: docType || 'logbook',
        fileName: file.originalname,
        fileUrl,
      });

      // If logbook uploaded, mark as verified
      if (docType === 'logbook') {
        await storage.updateCar(carId, userId, { logbookVerified: true });
      }

      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const docId = parseInt(req.params.id);
      const userId = req.session.userId;

      await storage.deleteCarDocument(docId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Stripe routes
  app.get('/api/stripe/config', async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ message: "Failed to get Stripe configuration" });
    }
  });

  app.get('/api/stripe/products', async (req, res) => {
    try {
      const rows = await storage.listStripeProductsWithPrices();
      
      // Group prices by product
      const productsMap = new Map();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
          });
        }
      }

      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error listing products:", error);
      res.status(500).json({ message: "Failed to list products" });
    }
  });

  app.post('/api/stripe/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { priceId, carId } = req.body;
      if (!priceId) {
        return res.status(400).json({ message: "Price ID is required" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email, user.id);
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      // Create checkout session
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${baseUrl}/sell/success?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/sell?cancelled=true`,
        carId ? { carId: String(carId), userId } : { userId }
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get('/api/stripe/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }

      const subscription = await storage.getStripeSubscription(user.stripeSubscriptionId);
      res.json({ subscription });
    } catch (error) {
      console.error("Error getting subscription:", error);
      res.status(500).json({ message: "Failed to get subscription" });
    }
  });

  app.post('/api/stripe/portal', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No Stripe customer found" });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${baseUrl}/account`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  // Buyer Voice Chat routes
  app.post('/api/chat/session', async (req: any, res) => {
    try {
      const userId = req.session?.userId || null;
      const session = await storage.createChatSession({ userId, activeFilters: {}, status: 'active' });
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get('/api/chat/session/:id', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const messages = await storage.getChatMessages(sessionId);
      // Strip sensitive fields from messages
      const sanitizedMessages = messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
      res.json({ session: { id: session.id, status: session.status }, messages: sanitizedMessages });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  app.post('/api/chat/session/:id/message', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const { content, isVoice, transcriptText } = req.body;

      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Save user message
      await storage.addChatMessage({
        sessionId,
        role: 'user',
        content: transcriptText || content,
        transcriptText: isVoice ? transcriptText : null,
      });

      // Get conversation history
      const messages = await storage.getChatMessages(sessionId);
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      // Process with OpenAI
      const currentFilters = (session.activeFilters || {}) as CarSearchFilters;
      const response = await processCarSearchChat(content, currentFilters, history);

      // Update session filters
      await storage.updateChatFilters(sessionId, response.filters);

      // Save assistant message
      const assistantMessage = await storage.addChatMessage({
        sessionId,
        role: 'assistant',
        content: response.message,
      });

      // If should search, get cars with current filters
      let cars: any[] = [];
      if (response.shouldSearch) {
        cars = await storage.getCars(response.filters);
      }

      // Strip sensitive fields from response
      const sanitizedMessage = {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      };
      
      // Strip sensitive fields from cars (sellerId, etc.)
      const sanitizedCars = cars.map((car: any) => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        location: car.location,
        fuelType: car.fuelType,
        transmission: car.transmission,
        imageUrl: car.imageUrl,
        verificationScore: car.verificationScore,
        logbookVerified: car.logbookVerified,
        mileageVerified: car.mileageVerified,
        photosVerified: car.photosVerified,
        priceGood: car.priceGood,
        bodyType: car.bodyType,
        color: car.color,
        condition: car.condition,
      }));

      res.json({
        message: sanitizedMessage,
        filters: response.filters,
        shouldSearch: response.shouldSearch,
        cars: sanitizedCars,
      });
    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  return httpServer;
}
