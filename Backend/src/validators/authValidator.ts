import { z } from "zod";

// Roles allowed through the PUBLIC JSON registration endpoint.
// OFFICER must use POST /api/auth/register-officer (multipart + documents).
// ADMIN must never be self-registrable.
export const publicRoles = ["FARMER", "SELLER", "BUYER"] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(publicRoles, {
    error: "Role must be one of: FARMER, SELLER, BUYER",
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
