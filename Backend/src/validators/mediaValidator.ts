import { z } from "zod";

export const mediaUploadSchema = z.object({
  mediaType: z.enum(["IMAGE", "AUDIO"], {
    error: 'mediaType must be "IMAGE" or "AUDIO"',
  }),
  purpose: z.enum(
    ["crop-images", "voice-queries", "products", "profiles", "certificates"],
    {
      error: 'purpose must be one of: crop-images, voice-queries, products, profiles, certificates',
    },
  ),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
