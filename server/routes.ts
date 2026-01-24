import type { Express } from "express";
import express from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Admin middleware
const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  const user = await authStorage.getUser(req.user.claims.sub);
  if (!user || user.isAdmin !== "true") {
    return res.status(403).json({ message: "غير مصرح - للمسؤولين فقط" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Custom Email/Password Login Route
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "يرجى إدخال البريد الإلكتروني وكلمة المرور" });
      }

      const user = await authStorage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      if (!user.password) {
        return res.status(401).json({ message: "هذا الحساب غير مفعل. يرجى التواصل مع المسؤول" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }

      // Set session user (compatible with existing isAuthenticated middleware)
      req.session.user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        }
      };

      res.json({ 
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // Custom Logout Route
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // === Car Routes ===

  // List Cars (Protected - only shows user's cars)
  app.get(api.cars.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub; // Get authenticated user ID
      const cars = await storage.getCars(userId);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get Single Car (Protected)
  app.get(api.cars.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const car = await storage.getCar(Number(req.params.id));
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      // Security check: Ensure car belongs to user
      if (car.userId !== req.user.claims.sub) {
        return res.status(401).json({ message: "Unauthorized access to this car" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create Car (Protected - Admin or User for demo)
  app.post(api.cars.create.path, isAuthenticated, async (req: any, res) => {
    try {
      // Force userId to match authenticated user
      const carData = {
        ...req.body,
        userId: req.user.claims.sub
      };
      
      const input = api.cars.create.input.parse(carData);
      const car = await storage.createCar(input);
      res.status(201).json(car);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update Car
  app.put(api.cars.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const car = await storage.getCar(id);
      
      if (!car) return res.status(404).json({ message: "Car not found" });
      if (car.userId !== req.user.claims.sub) return res.status(401).json({ message: "Unauthorized" });

      const input = api.cars.update.input.parse(req.body);
      const updated = await storage.updateCar(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete Car
  app.delete(api.cars.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const car = await storage.getCar(id);
      
      if (!car) return res.status(404).json({ message: "Car not found" });
      if (car.userId !== req.user.claims.sub) return res.status(401).json({ message: "Unauthorized" });

      await storage.deleteCar(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // === Admin Routes ===

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Upload image (Admin only)
  app.post("/api/upload", isAuthenticated, isAdmin, upload.single("image"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Get all users (Admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords to frontend
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isAdmin: u.isAdmin,
        createdAt: u.createdAt,
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  // Get all cars (Admin only)
  app.get("/api/admin/cars", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allCars = await storage.getAllCars();
      res.json(allCars);
    } catch (error) {
      console.error("Error fetching all cars:", error);
      res.status(500).json({ message: "خطأ في جلب السيارات" });
    }
  });

  // Create car for any user (Admin only)
  app.post("/api/admin/cars", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const carData = req.body;
      if (!carData.userId) {
        return res.status(400).json({ message: "يجب تحديد المستخدم" });
      }
      const input = api.cars.create.input.parse(carData);
      const car = await storage.createCar(input);
      res.status(201).json(car);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Admin create car error:", err);
      res.status(500).json({ message: "خطأ في إنشاء السيارة" });
    }
  });

  // Update any car (Admin only)
  app.put("/api/admin/cars/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const car = await storage.getCar(id);
      if (!car) return res.status(404).json({ message: "السيارة غير موجودة" });
      
      // Strip userId from update payload to avoid schema validation issues
      const { userId, ...updateData } = req.body;
      const input = api.cars.update.input.parse(updateData);
      const updated = await storage.updateCar(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "خطأ في تحديث السيارة" });
    }
  });

  // Delete any car (Admin only)
  app.delete("/api/admin/cars/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const car = await storage.getCar(id);
      if (!car) return res.status(404).json({ message: "السيارة غير موجودة" });
      
      await storage.deleteCar(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف السيارة" });
    }
  });

  // Check if current user is admin
  app.get("/api/auth/is-admin", isAuthenticated, async (req: any, res) => {
    try {
      const user = await authStorage.getUser(req.user.claims.sub);
      res.json({ isAdmin: user?.isAdmin === "true" });
    } catch (error) {
      res.status(500).json({ isAdmin: false });
    }
  });

  // === Seed Route (For Demo Purposes) ===
  app.post("/api/seed", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const existing = await storage.getCars(userId);
    
    if (existing.length > 0) {
      return res.json({ message: "Data already seeded for this user", cars: existing });
    }

    // Seed Data
    const demoCars = [
      {
        userId,
        make: "Toyota",
        model: "Land Cruiser",
        year: 2024,
        vin: "JTMHT05J123456789",
        color: "Pearl White",
        status: "In Transit",
        price: 85000,
        imageUrl: "https://images.unsplash.com/photo-1594502184342-2e12f877aa71?auto=format&fit=crop&q=80&w=1000",
        details: "V6 Twin Turbo, GR Sport Edition",
        containerNumber: "MSCU7654321",
        bookingNumber: "BKG-2024-001234",
        trackingUrl: "https://www.searates.com/container/tracking/"
      },
      {
        userId,
        make: "Lexus",
        model: "LX 600",
        year: 2023,
        vin: "JTJHT00J987654321",
        color: "Black",
        status: "Purchased",
        price: 120000,
        imageUrl: "https://images.unsplash.com/photo-1678201588691-62057c323a7e?auto=format&fit=crop&q=80&w=1000",
        details: "VIP Package, 4-Seater",
        containerNumber: null,
        bookingNumber: null,
        trackingUrl: null
      },
      {
        userId,
        make: "Mercedes-Benz",
        model: "G 63 AMG",
        year: 2025,
        vin: "WDB4632761X123456",
        color: "Matte Black",
        status: "In Transit",
        price: 200000,
        imageUrl: "https://images.unsplash.com/photo-1520031441872-265e4e9d96b5?auto=format&fit=crop&q=80&w=1000",
        details: "Night Package, Red Interior",
        containerNumber: "HLBU9876543",
        bookingNumber: "BKG-2024-005678",
        trackingUrl: "https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html"
      },
      {
        userId,
        make: "Nissan",
        model: "Patrol",
        year: 2024,
        vin: "JN1TBNT30Z0123456",
        color: "Titanium Grey",
        status: "In Transit",
        price: 75000,
        imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=1000",
        details: "Platinum Edition, V8",
        containerNumber: "MAEU1234567",
        bookingNumber: "BKG-2024-009012",
        trackingUrl: "https://www.maersk.com/tracking/"
      }
    ];

    const createdCars = [];
    for (const car of demoCars) {
      createdCars.push(await storage.createCar(car));
    }

    res.json({ message: "Seeded demo cars successfully", cars: createdCars });
  });

  // === Force Reseed Route (Deletes existing and reseeds) ===
  app.post("/api/reseed", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    // Delete existing cars for this user
    const existing = await storage.getCars(userId);
    for (const car of existing) {
      await storage.deleteCar(car.id);
    }

    // Reseed with new data
    const demoCars = [
      {
        userId,
        make: "Toyota",
        model: "Land Cruiser",
        year: 2024,
        vin: "JTMHT05J123456789",
        color: "Pearl White",
        status: "In Transit",
        price: 85000,
        imageUrl: "https://images.unsplash.com/photo-1594502184342-2e12f877aa71?auto=format&fit=crop&q=80&w=1000",
        details: "V6 Twin Turbo, GR Sport Edition",
        containerNumber: "MSCU7654321",
        bookingNumber: "BKG-2024-001234",
        trackingUrl: "https://www.searates.com/container/tracking/"
      },
      {
        userId,
        make: "Lexus",
        model: "LX 600",
        year: 2023,
        vin: "JTJHT00J987654321",
        color: "Black",
        status: "Purchased",
        price: 120000,
        imageUrl: "https://images.unsplash.com/photo-1678201588691-62057c323a7e?auto=format&fit=crop&q=80&w=1000",
        details: "VIP Package, 4-Seater",
        containerNumber: null,
        bookingNumber: null,
        trackingUrl: null
      },
      {
        userId,
        make: "Mercedes-Benz",
        model: "G 63 AMG",
        year: 2025,
        vin: "WDB4632761X123456",
        color: "Matte Black",
        status: "In Transit",
        price: 200000,
        imageUrl: "https://images.unsplash.com/photo-1520031441872-265e4e9d96b5?auto=format&fit=crop&q=80&w=1000",
        details: "Night Package, Red Interior",
        containerNumber: "HLBU9876543",
        bookingNumber: "BKG-2024-005678",
        trackingUrl: "https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html"
      },
      {
        userId,
        make: "Nissan",
        model: "Patrol",
        year: 2024,
        vin: "JN1TBNT30Z0123456",
        color: "Titanium Grey",
        status: "In Transit",
        price: 75000,
        imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=1000",
        details: "Platinum Edition, V8",
        containerNumber: "MAEU1234567",
        bookingNumber: "BKG-2024-009012",
        trackingUrl: "https://www.maersk.com/tracking/"
      }
    ];

    const createdCars = [];
    for (const car of demoCars) {
      createdCars.push(await storage.createCar(car));
    }

    res.json({ message: "Reseeded demo cars successfully", cars: createdCars });
  });

  return httpServer;
}
