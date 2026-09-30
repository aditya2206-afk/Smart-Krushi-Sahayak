import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import path from "node:path";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import sellerOrderRoutes from "./routes/sellerOrderRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import officerQueryRoutes from "./routes/officerQueryRoutes.js";
import officerVerificationRoutes from "./routes/officerVerificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : true,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller/orders", sellerOrderRoutes);
app.use("/api/queries", queryRoutes);
// IMPORTANT: verification router FIRST. Both officer routers share the
// /api/officer prefix, and Express matches routers in mount order. The query
// router's middleware must never swallow /verification or /certificates for
// PENDING officers.
app.use("/api/officer", officerVerificationRoutes);
app.use("/api/officer", officerQueryRoutes);
app.use("/api/admin", adminRoutes);
// Serve officer certificate files (generated filenames only, no FS paths).
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Smart Krushi Sahayak backend is running",
  });
});

app.get("/api/db-test", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({
      success: true,
      message: "Database connected successfully",
      users,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Krushi Sahayak backend running on port ${PORT}`);
});
