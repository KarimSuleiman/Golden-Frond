import type { Express } from "express";
import express from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

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
  limits: { fileSize: 5 * 1024 * 1024 },
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

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "amairehkareem@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendResetEmail(toEmail: string, resetCode: string) {
  const mailOptions = {
    from: '"السعفة الذهبية - Golden Palm" <amairehkareem@gmail.com>',
    to: toEmail,
    subject: "رمز إعادة تعيين كلمة المرور - Password Reset Code",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f5e8; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #b8860b; margin: 0;">السعفة الذهبية</h1>
          <p style="color: #666; margin: 5px 0;">Golden Palm Car Trading</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 8px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 10px;">إعادة تعيين كلمة المرور</h2>
          <p style="color: #666; margin-bottom: 20px;">لقد طلبت إعادة تعيين كلمة المرور. استخدم الرمز التالي:</p>
          <div style="background: #f0e6c8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b8860b; font-family: monospace;">${resetCode}</span>
          </div>
          <p style="color: #999; font-size: 14px;">هذا الرمز صالح لمدة ساعة واحدة فقط</p>
          <p style="color: #999; font-size: 14px;">This code is valid for 1 hour only</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد</p>
        </div>
      </div>
    `,
  };

  await emailTransporter.sendMail(mailOptions);
}

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

const isMainAdmin = async (req: any, res: any, next: any) => {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  const user = await authStorage.getUser(req.user.claims.sub);
  if (!user || user.role !== "main_admin") {
    return res.status(403).json({ message: "غير مصرح - للمسؤول الرئيسي فقط" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

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

  app.get(api.cars.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cars = await storage.getCars(userId);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.cars.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const car = await storage.getCar(Number(req.params.id));
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      if (car.userId !== req.user.claims.sub) {
        return res.status(401).json({ message: "Unauthorized access to this car" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.cars.create.path, isAuthenticated, async (req: any, res) => {
    try {
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

  app.use("/uploads", express.static(uploadDir));

  app.post("/api/upload", isAuthenticated, isAdmin, upload.single("image"), (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        isAdmin: u.isAdmin,
        role: u.role || "user",
        createdAt: u.createdAt,
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  app.put("/api/admin/users/:id/role", isAuthenticated, isMainAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ["user", "trader", "backup_admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "رتبة غير صالحة" });
      }

      const targetUser = await authStorage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      if (targetUser.role === "main_admin") {
        return res.status(403).json({ message: "لا يمكن تغيير رتبة المسؤول الرئيسي" });
      }

      const updated = await authStorage.updateUserRole(id, role);
      res.json({ 
        message: "تم تحديث الرتبة بنجاح", 
        user: { id: updated?.id, role: updated?.role, isAdmin: updated?.isAdmin }
      });
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({ message: "خطأ في تحديث الرتبة" });
    }
  });

  app.get("/api/admin/cars", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const allCars = await storage.getAllCars();
      res.json(allCars);
    } catch (error) {
      console.error("Error fetching all cars:", error);
      res.status(500).json({ message: "خطأ في جلب السيارات" });
    }
  });

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

  app.put("/api/admin/cars/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const car = await storage.getCar(id);
      if (!car) return res.status(404).json({ message: "السيارة غير موجودة" });
      
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

  app.get("/api/auth/is-admin", isAuthenticated, async (req: any, res) => {
    try {
      const user = await authStorage.getUser(req.user.claims.sub);
      res.json({ 
        isAdmin: user?.isAdmin === "true",
        role: user?.role || "user",
        isMainAdmin: user?.role === "main_admin"
      });
    } catch (error) {
      res.status(500).json({ isAdmin: false, role: "user", isMainAdmin: false });
    }
  });

  // === Forgot Password Routes ===

  app.post("/api/auth/forgot-password", async (req: any, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "يرجى إدخال البريد الإلكتروني" });
      }

      const user = await authStorage.getUserByEmail(email);
      
      if (!user) {
        return res.json({ 
          message: "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رمز إعادة التعيين",
          success: true 
        });
      }

      const resetToken = crypto.randomBytes(3).toString("hex").toUpperCase();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await authStorage.setResetToken(user.id, resetToken, resetTokenExpiry);

      try {
        await sendResetEmail(email, resetToken);
        console.log(`Reset email sent to ${email}`);
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
        return res.status(500).json({ 
          message: "حدث خطأ أثناء إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً",
          success: false 
        });
      }

      res.json({ 
        message: "تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني",
        success: true
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إعادة تعيين كلمة المرور" });
    }
  });

  app.post("/api/auth/reset-password", async (req: any, res) => {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        return res.status(400).json({ message: "يرجى إدخال جميع البيانات المطلوبة" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const user = await authStorage.getUserByEmail(email);
      
      if (!user) {
        return res.status(400).json({ message: "البريد الإلكتروني غير موجود" });
      }

      if (!user.resetToken || user.resetToken !== token.toUpperCase()) {
        return res.status(400).json({ message: "رمز إعادة التعيين غير صحيح" });
      }

      if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ message: "انتهت صلاحية رمز إعادة التعيين" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await authStorage.updateUserPassword(user.id, hashedPassword);
      await authStorage.clearResetToken(user.id);

      res.json({ message: "تم تغيير كلمة المرور بنجاح", success: true });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  app.put("/api/admin/users/:id/password", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const user = await authStorage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await authStorage.updateUserPassword(id, hashedPassword);

      res.json({ message: "تم تغيير كلمة المرور بنجاح", success: true });
    } catch (error) {
      console.error("Admin change password error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  // === Seed Route (For Demo Purposes) ===
  app.post("/api/seed", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const existing = await storage.getCars(userId);
    
    if (existing.length > 0) {
      return res.json({ message: "Data already seeded for this user", cars: existing });
    }

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
    ];

    const createdCars = [];
    for (const car of demoCars) {
      createdCars.push(await storage.createCar(car));
    }

    res.json({ message: "Seeded demo cars successfully", cars: createdCars });
  });

  return httpServer;
}
