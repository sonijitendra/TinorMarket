import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertBookingSchema, insertUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Product routes
  app.get("/api/products/search", async (req, res) => {
    try {
      const { q, lat, lng, distance } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const latitude = lat ? parseFloat(lat as string) : undefined;
      const longitude = lng ? parseFloat(lng as string) : undefined;
      const maxDistance = distance ? parseFloat(distance as string) : 10;

      const products = await storage.searchProducts(
        q as string,
        latitude,
        longitude,
        maxDistance
      );

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.post("/api/products", authenticateToken, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Verify user owns the shop
      const shop = await storage.getShop(productData.shopId);
      if (!shop || shop.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.get("/api/products/shop/:shopId", async (req, res) => {
    try {
      const shopId = parseInt(req.params.shopId);
      const products = await storage.getProductsByShopId(shopId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.patch("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const updates = req.body;

      // Verify user owns the product
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const shop = await storage.getShop(product.shopId);
      if (!shop || shop.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedProduct = await storage.updateProduct(productId, updates);
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);

      // Verify user owns the product
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const shop = await storage.getShop(product.shopId);
      if (!shop || shop.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const deleted = await storage.deleteProduct(productId);
      if (deleted) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if product has enough stock
      const product = await storage.getProduct(bookingData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < bookingData.quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      // Create booking
      const booking = await storage.createBooking(bookingData);

      // Update product stock
      await storage.updateProduct(product.id, {
        stock: product.stock - bookingData.quantity
      });

      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data", error });
    }
  });

  app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.get("/api/bookings/shop/:shopId", authenticateToken, async (req, res) => {
    try {
      const shopId = parseInt(req.params.shopId);
      
      // Verify user owns the shop
      const shop = await storage.getShop(shopId);
      if (!shop || shop.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const bookings = await storage.getBookingsByShopId(shopId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  app.patch("/api/bookings/:id", authenticateToken, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const updates = req.body;

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify user owns the shop or is the customer
      const isOwner = booking.shop.ownerId === req.user.id;
      const isCustomer = booking.userId === req.user.id;
      
      if (!isOwner && !isCustomer) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedBooking = await storage.updateBooking(bookingId, updates);
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  // Shop routes
  app.get("/api/shops/owner/:ownerId", authenticateToken, async (req, res) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      
      if (req.user.id !== ownerId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const shops = await storage.getShopsByOwnerId(ownerId);
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
