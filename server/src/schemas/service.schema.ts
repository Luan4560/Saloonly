import { z } from "zod";
import { EstablishmentType } from "@prisma/client";

export const createServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  establishment_id: z.string(),
  collaborator_id: z.string().optional(),
  establishmentType: z.nativeEnum(EstablishmentType),
  active: z.boolean(),
});

export const updateServiceSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  active: z.boolean(),
});
