import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import {
  AppError,
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService.js";
import { loginSchema, registerSchema } from "../validators/authValidator.js";

function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message ?? "Validation failed";
}

function handleError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }
  console.error("Auth error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    // Officers must use POST /api/auth/register-officer with documents.
    const role = typeof req.body?.role === "string" ? req.body.role.trim().toUpperCase() : "";
    if (role === "OFFICER") {
      res.status(400).json({
        success: false,
        message: "Officers must register via Krushi Adhikari registration with verification documents.",
      });
      return;
    }
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
      return;
    }

    const user = await registerUser(parsed.data);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: formatZodError(parsed.error),
      });
      return;
    }

    const result = await loginUser(parsed.data.email, parsed.data.password);

    res.status(200).json({
      success: true,
      message: result.requiresVerification
        ? (result.verificationMessage ?? "Your Krushi Adhikari account is awaiting admin verification.")
        : "Login successful",
      token: result.token,
      user: result.user,
      ...(result.requiresVerification
        ? {
            requiresVerification: true,
            verificationStatus: result.verificationStatus,
          }
        : {}),
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid Bearer token.",
      });
      return;
    }

    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    handleError(res, error);
  }
}
