import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

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
        details: "V6 Twin Turbo, GR Sport Edition"
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
        details: "VIP Package, 4-Seater"
      },
      {
        userId,
        make: "Mercedes-Benz",
        model: "G 63 AMG",
        year: 2025,
        vin: "WDB4632761X123456",
        color: "Matte Black",
        status: "Reserved",
        price: 200000,
        imageUrl: "https://images.unsplash.com/photo-1520031441872-265e4e9d96b5?auto=format&fit=crop&q=80&w=1000",
        details: "Night Package, Red Interior"
      }
    ];

    const createdCars = [];
    for (const car of demoCars) {
      createdCars.push(await storage.createCar(car));
    }

    res.json({ message: "Seeded demo cars successfully", cars: createdCars });
  });

  return httpServer;
}
