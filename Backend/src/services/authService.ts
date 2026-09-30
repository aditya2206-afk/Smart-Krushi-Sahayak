import bcrypt from "bcryptjs";
import type { OfficerVerificationStatus, Role, User } from "../generated/prisma/client.js";
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
  verificationStatus?: OfficerVerificationStatus | undefined;
}

export interface CurrentUser extends SafeUser {
  createdAt: Date;
}

export interface LoginResult {
  token: string;
  user: SafeUser;
  requiresVerification: boolean;
  verificationStatus?: OfficerVerificationStatus | undefined;
  verificationMessage?: string | undefined;
}

type UserRow = Pick<User, "id" | "name" | "email" | "role" | "isActive" | "createdAt">;

function toSafeUser(user: UserRow, verificationStatus?: OfficerVerificationStatus): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    ...(verificationStatus ? { verificationStatus } : {}),
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
    return toSafeUser(user, undefined);
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
    include: { officerProfile: { select: { verificationStatus: true } } },
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

  // Officers authenticate but stay gated until VERIFIED. They receive a normal
  // JWT so they can open ONLY the verification-status + certificate endpoints.
  if (user.role === "OFFICER") {
    // Backfill: officers created before verification existed get PENDING.
    let status = user.officerProfile?.verificationStatus;
    if (!status) {
      const created = await prisma.officerProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, verificationStatus: "PENDING" },
        update: {},
        select: { verificationStatus: true },
      });
      status = created.verificationStatus;
    }
    if (status === "VERIFIED") {
      return { token, user: toSafeUser(user, status), requiresVerification: false, verificationStatus: status };
    }
    const messages: Record<string, string> = {
      PENDING: "Your Krushi Adhikari account is awaiting admin verification.",
      REJECTED: "Your Krushi Adhikari verification was rejected. Please review the administrator's note.",
      REUPLOAD_REQUIRED: "One or more of your verification documents must be uploaded again.",
    };
    return {
      token,
      user: toSafeUser(user, status),
      requiresVerification: true,
      verificationStatus: status,
      verificationMessage: messages[status] ?? "Your Krushi Adhikari account is awaiting admin verification.",
    };
  }

  return { token, user: toSafeUser(user), requiresVerification: false };
}

export async function getCurrentUser(userId: number): Promise<CurrentUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { officerProfile: { select: { verificationStatus: true } } },
  });

  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401);
  }

  return {
    ...toSafeUser(user, user.officerProfile?.verificationStatus),
    createdAt: user.createdAt,
  };
}
