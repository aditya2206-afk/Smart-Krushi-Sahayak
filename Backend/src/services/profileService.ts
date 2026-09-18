import type { Role } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError, type SafeUser } from "./authService.js";
import type { BuyerProfileInput, FarmerProfileInput, OfficerProfileInput, SellerProfileInput } from "../validators/profileValidator.js";

type ProfileData = FarmerProfileInput | SellerProfileInput | BuyerProfileInput | OfficerProfileInput;

function safeUser(u: { id: number; name: string; email: string; role: Role; isActive: boolean }): SafeUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive };
}

function clean(v: string | undefined): string | null | undefined {
  if (v === undefined) return undefined;
  if (v.trim() === "") return null;
  return v.trim();
}

function stripMeta(p: Record<string, unknown>) {
  const { id: _a, userId: _b, createdAt: _c, updatedAt: _d, ...rest } = p;
  void _a; void _b; void _c; void _d;
  return rest;
}

export async function getMyProfile(userId: number, role: Role) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw new AppError("User not found or inactive", 401);
  let raw: Record<string, unknown> | null = null;
  if (role === "FARMER") raw = await prisma.farmerProfile.findUnique({ where: { userId } });
  else if (role === "SELLER") raw = await prisma.sellerProfile.findUnique({ where: { userId } });
  else if (role === "BUYER") raw = await prisma.buyerProfile.findUnique({ where: { userId } });
  else if (role === "OFFICER") raw = await prisma.officerProfile.findUnique({ where: { userId } });
  else if (role === "ADMIN") raw = null;
  else throw new AppError("Invalid role", 400);
  if (!raw) return { user: safeUser(user), profile: null, profileCompleted: false };
  return { user: safeUser(user), profile: stripMeta(raw), profileCompleted: true };
}

export async function updateMyProfile(userId: number, role: Role, input: ProfileData) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) throw new AppError("User not found or inactive", 401);
  const { name, ...fields } = input as ProfileData & { name?: string };
  let updatedUser = user;
  if (typeof name === "string" && name.trim() !== "" && name.trim() !== user.name) {
    updatedUser = await prisma.user.update({ where: { id: userId }, data: { name: name.trim() } });
  }
  let raw: Record<string, unknown> | null = null;
  if (role === "FARMER") {
    const d = fields as FarmerProfileInput;
    const data = { phone: clean(d.phone), village: clean(d.village), district: clean(d.district), state: clean(d.state), preferredLanguage: clean(d.preferredLanguage), farmSize: clean(d.farmSize) };
    const crops = d.mainCrops === undefined ? undefined : d.mainCrops.map((c) => c.trim()).filter(Boolean);
    raw = await prisma.farmerProfile.upsert({ where: { userId }, create: { userId, ...data, phone: data.phone ?? null, village: data.village ?? null, district: data.district ?? null, state: data.state ?? null, preferredLanguage: data.preferredLanguage ?? null, farmSize: data.farmSize ?? null, mainCrops: crops ?? [] }, update: { ...data, ...(crops !== undefined ? { mainCrops: crops } : {}) } });
  } else if (role === "SELLER") {
    const d = fields as SellerProfileInput;
    raw = await prisma.sellerProfile.upsert({ where: { userId }, create: { userId, businessName: clean(d.businessName) ?? null, phone: clean(d.phone) ?? null, address: clean(d.address) ?? null, district: clean(d.district) ?? null, state: clean(d.state) ?? null, description: clean(d.description) ?? null }, update: { businessName: clean(d.businessName), phone: clean(d.phone), address: clean(d.address), district: clean(d.district), state: clean(d.state), description: clean(d.description) } });
  } else if (role === "BUYER") {
    const d = fields as BuyerProfileInput;
    raw = await prisma.buyerProfile.upsert({ where: { userId }, create: { userId, phone: clean(d.phone) ?? null, address: clean(d.address) ?? null, district: clean(d.district) ?? null, state: clean(d.state) ?? null }, update: { phone: clean(d.phone), address: clean(d.address), district: clean(d.district), state: clean(d.state) } });
  } else if (role === "OFFICER") {
    const d = fields as OfficerProfileInput;
    raw = await prisma.officerProfile.upsert({ where: { userId }, create: { userId, phone: clean(d.phone) ?? null, designation: clean(d.designation) ?? null, qualification: clean(d.qualification) ?? null, specialization: clean(d.specialization) ?? null, department: clean(d.department) ?? null, experienceYears: d.experienceYears ?? null, officerId: clean(d.officerId) ?? null, district: clean(d.district) ?? null, state: clean(d.state) ?? null }, update: { phone: clean(d.phone), designation: clean(d.designation), qualification: clean(d.qualification), specialization: clean(d.specialization), department: clean(d.department), experienceYears: d.experienceYears, officerId: clean(d.officerId), district: clean(d.district), state: clean(d.state) } });
  } else if (role === "ADMIN") {
    return { user: safeUser(updatedUser), profile: null, profileCompleted: true };
  } else throw new AppError("Invalid role", 400);
  if (!raw) return { user: safeUser(updatedUser), profile: null, profileCompleted: false };
  return { user: safeUser(updatedUser), profile: stripMeta(raw), profileCompleted: true };
}

