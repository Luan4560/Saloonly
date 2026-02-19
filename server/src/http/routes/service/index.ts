import { FastifyTypedInstance } from "@/types";
import { paginationQuerySchema } from "@/schemas/pagination.schema";

import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "@/http/controllers/service.controller";

export function servicesRoutes(app: FastifyTypedInstance) {
  app.post("/register", { preHandler: [app.authenticate] }, createService);

  app.get(
    "/list",
    {
      preHandler: [app.authenticate],
      schema: {
        querystring: paginationQuerySchema,
      },
    },
    getServices,
  );

  app.get("/:id", { preHandler: [app.authenticate] }, getServiceById);

  app.patch("/:id", { preHandler: [app.authenticate] }, updateService);

  app.delete("/:id", { preHandler: [app.authenticate] }, deleteService);
}
