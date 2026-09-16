import bcrypt from "bcryptjs";
import type { Role, User } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../utils/jwt.js";
import type { RegisterInput } from "../validators/authValidator.js";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const SALT_ROUNDS = 12;

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface CurrentUser extends SafeUser {
  createdAt: Date;
}

export interface LoginResult {
  token: string;
  user: SafeUser;
}

type UserRow = Pick<User, "id" | "name" | "email" | "role" | "isActive" | "createdAt">;

function toSafeUser(user: UserRow): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
      },
    });
    return toSafeUser(user);
  } catch (error: unknown) {
    // Guard against a race where two requests register the same email
    // concurrently. Never leak raw Prisma errors to clients.
    if (isUniqueConstraintError(error)) {
      throw new AppError("Email already registered", 409);
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Generic message: never reveal whether the email or the password was wrong.
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account is inactive. Please contact support.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id, role: user.role });

  return { token, user: toSafeUser(user) };
}

export async function getCurrentUser(userId: number): Promise<CurrentUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401);
  }

  return {
    ...toSafeUser(user),
    createdAt: user.createdAt,
  };
}
