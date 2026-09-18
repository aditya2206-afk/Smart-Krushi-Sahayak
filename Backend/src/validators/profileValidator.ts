import { z } from "zod";

const nameField = z.string().trim().min(1, "Name is required").max(100).optional();
const phoneField = z.string().trim().max(20).optional();
const shortText = (max = 120) => z.string().trim().max(max).optional();
const longText = (max = 500) => z.string().trim().max(max).optional();

export const farmerProfileSchema = z
  .object({
    name: nameField,
    phone: phoneField,
    village: shortText(),
    district: shortText(),
    state: shortText(),
    preferredLanguage: z.enum(["English", "Marathi", "Hindi"]).optional(),
    farmSize: shortText(60),
    mainCrops: z.array(z.string().trim().min(1).max(60)).max(30).optional(),
  })
  .strict();

export const sellerProfileSchema = z
  .object({
    name: nameField,
    businessName: shortText(),
    phone: phoneField,
    address: longText(300),
    district: shortText(),
    state: shortText(),
    description: longText(1000),
  })
  .strict();

export const buyerProfileSchema = z
  .object({
    name: nameField,
    phone: phoneField,
    address: longText(300),
    district: shortText(),
    state: shortText(),
  })
  .strict();

export const officerProfileSchema = z
  .object({
    name: nameField,
    phone: phoneField,
    designation: shortText(),
    qualification: shortText(),
    specialization: shortText(),
    department: shortText(),
    experienceYears: z.number().int().min(0).max(60).optional(),
    officerId: shortText(60),
    district: shortText(),
    state: shortText(),
  })
  .strict();

export type FarmerProfileInput = z.infer<typeof farmerProfileSchema>;
export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;
export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;
export type OfficerProfileInput = z.infer<typeof officerProfileSchema>;
