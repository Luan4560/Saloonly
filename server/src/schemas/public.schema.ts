import z from "zod";
import { EstablishmentType } from "@/lib/prisma";
import { paginationQuerySchema } from "./pagination.schema";

export const searchEstablishmentsQuerySchema = paginationQuerySchema.merge(
  z.object({
    name: z.string().min(1).optional(),
    type: z.nativeEnum(EstablishmentType).optional(),
    address: z.string().min(1).optional(),
  }),
);

export type SearchEstablishmentsQuery = z.infer<
  typeof searchEstablishmentsQuerySchema
>;

export const getPublicEstablishmentParamsSchema = z.object({
  id: z.string().uuid(),
});

export const getAvailableSlotsPublicQuerySchema = z.object({
  date: z.coerce.date(),
  collaborator_id: z.string().uuid().optional(),
  slot_duration_minutes: z.coerce.number().int().min(5).max(120).default(30),
});
