import { z } from "zod";
import { EstablishmentType, ServiceType } from "@prisma/client";

export const createServiceSchema = z.object({
  description: z.string(),
  price: z.number(),
  duration: z.number(),
  establishment_id: z.string(),
  collaborator_id: z.string(),
  establishmentType: z.nativeEnum(EstablishmentType),
  serviceType: z.nativeEnum(ServiceType),
});
