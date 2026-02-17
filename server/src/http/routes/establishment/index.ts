import { FastifyTypedInstance } from "@/types";
import {
  deleteEstablishment,
  getEstablishmentById,
  getEstablishments,
  registerEstablishment,
  updateEstablishment,
} from "@/http/controllers/establishment.controller";
import {
  registerEstablishmentResponseSchema,
  registerEstablishmentSchemaResponse,
} from "@/schemas/establishment.schema";

export async function establishmentRoutes(app: FastifyTypedInstance) {
  app.post(
    "/register",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Establishment"],
        description: "Register establishment",
        body: registerEstablishmentSchemaResponse.schema.body,
        response: {
          201: registerEstablishmentResponseSchema,
        },
      },
    },
    registerEstablishment
  );

  app.get(
    "/list",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Establishment"],
        description: "List all establishments",
      },
    },
    getEstablishments
  );

  app.get(
    "/:establishment_id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Establishment"],
        description: "Get establishment by id",
      },
    },
    getEstablishmentById
  );

  app.patch(
    "/:establishment_id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Establishment"],
        description: "Update establishment",
      },
    },
    updateEstablishment
  );

  app.delete(
    "/:establishment_id",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Establishment"],
        description: "Delete establishment",
      },
    },
    deleteEstablishment
  );
}
