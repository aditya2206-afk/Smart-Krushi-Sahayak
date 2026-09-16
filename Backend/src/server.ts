import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Smart Krushi Sahayak backend is running",
  });
});

app.get("/api/db-test", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
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
