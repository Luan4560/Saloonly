import { z } from "zod";
import { EstablishmentType } from "@/lib/prisma";

export const createServiceSchema = z.object({
  description: z.string().optional(),
  price: z.number().refine((n) => n >= 0 && !isNaN(n), {
    message: "Price must be a valid positive number",
  }),
  duration: z.number().int().positive(),
  establishment_id: z.string().uuid(),
  collaborator_id: z.string().uuid().optional(),
  establishmentType: z.nativeEnum(EstablishmentType),
});

export const updateServiceSchema = z.object({
  description: z.string().optional(),
  price: z
    .number()
    .refine((n) => n >= 0 && !isNaN(n), {
      message: "Price must be a valid positive number",
    })
    .optional(),
  duration: z.number().int().positive().optional(),
  establishmentType: z.nativeEnum(EstablishmentType).optional(),
  active: z.boolean().optional(),
});
