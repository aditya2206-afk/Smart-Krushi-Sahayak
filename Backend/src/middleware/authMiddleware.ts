import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/client.js";
import { verifyToken } from "../utils/jwt.js";

export interface AuthUser {
  userId: number;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid Bearer token.",
    });
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid Bearer token.",
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    // Covers missing, malformed, invalid-signature and expired tokens.
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
