import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "../generated/prisma/client.js";

export interface JwtPayload {
  userId: number;
  role: Role;
}

const JWT_EXPIRES_IN = "7d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  const { userId, role } = decoded as { userId?: unknown; role?: unknown };
  if (typeof userId !== "number" || typeof role !== "string") {
    throw new Error("Invalid token payload");
  }
  return { userId, role: role as Role };
}
