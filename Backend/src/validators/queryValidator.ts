import { z } from "zod";

export const queryPriorities = ["LOW", "MEDIUM", "HIGH"] as const;
export const queryStatuses = ["PENDING", "IN_REVIEW", "ANSWERED", "CLOSED"] as const;

export const createQuerySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  cropName: z.string().trim().min(1, "Crop name is required").max(100),
  category: z.string().trim().min(1, "Category is required").max(100),
  description: z.string().trim().min(1, "Description is required").max(5000),
  priority: z.enum(queryPriorities, { error: "Priority must be one of: LOW, MEDIUM, HIGH" }).optional(),
});

export const officerQueryFilterSchema = z.object({
  status: z.enum(queryStatuses, { error: "Status must be one of: PENDING, IN_REVIEW, ANSWERED, CLOSED" }).optional(),
  priority: z.enum(queryPriorities, { error: "Priority must be one of: LOW, MEDIUM, HIGH" }).optional(),
  cropName: z.string().trim().min(1).max(100).optional(),
});

export const updateQueryStatusSchema = z.object({
  status: z.enum(queryStatuses, { error: "Status must be one of: PENDING, IN_REVIEW, ANSWERED, CLOSED" }),
});

export const respondToQuerySchema = z.object({
  diagnosis: z.string().trim().min(1, "Diagnosis is required").max(5000),
  recommendation: z.string().trim().min(1, "Recommendation is required").max(5000),
  fertilizerAdvice: z.string().trim().max(5000).optional(),
  pesticideAdvice: z.string().trim().max(5000).optional(),
  additionalNotes: z.string().trim().max(5000).optional(),
});

export type CreateQueryInput = z.infer<typeof createQuerySchema>;
export type OfficerQueryFilterInput = z.infer<typeof officerQueryFilterSchema>;
export type UpdateQueryStatusInput = z.infer<typeof updateQueryStatusSchema>;
export type RespondToQueryInput = z.infer<typeof respondToQuerySchema>;
