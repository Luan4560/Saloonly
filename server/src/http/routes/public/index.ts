import { FastifyTypedInstance } from "@/types";
import {
  searchEstablishmentsQuerySchema,
  getAvailableSlotsPublicQuerySchema,
  getPublicEstablishmentParamsSchema,
} from "@/schemas/public.schema";
import {
  searchEstablishments,
  getPublicEstablishmentById,
  getPublicEstablishmentServices,
  getPublicEstablishmentCollaborators,
  getPublicEstablishmentAvailableSlots,
} from "@/http/controllers/public.controller";

export async function publicRoutes(app: FastifyTypedInstance) {
  app.get(
    "/",
    {
      schema: {
        tags: ["Public"],
        description: "Search establishments by name, type, or address",
        querystring: searchEstablishmentsQuerySchema,
      },
    },
    searchEstablishments,
  );

  app.get(
    "/:id/available-slots",
    {
      schema: {
        tags: ["Public"],
        description: "Get available time slots for an establishment",
        params: getPublicEstablishmentParamsSchema,
        querystring: getAvailableSlotsPublicQuerySchema,
      },
    },
    getPublicEstablishmentAvailableSlots,
  );

  app.get(
    "/:id/services",
    {
      schema: {
        tags: ["Public"],
        description: "List active services of an establishment",
        params: getPublicEstablishmentParamsSchema,
      },
    },
    getPublicEstablishmentServices,
  );

  app.get(
    "/:id/collaborators",
    {
      schema: {
        tags: ["Public"],
        description: "List collaborators of an establishment",
        params: getPublicEstablishmentParamsSchema,
      },
    },
    getPublicEstablishmentCollaborators,
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["Public"],
        description: "Get establishment details by id",
        params: getPublicEstablishmentParamsSchema,
      },
    },
    getPublicEstablishmentById,
  );
}
