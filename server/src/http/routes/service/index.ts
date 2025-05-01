import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "@/http/controllers/service.controller";
import { FastifyTypedInstance } from "@/types";

export function servicesRoutes(app: FastifyTypedInstance) {
  app.post(
    "/createServices",
    { preHandler: [app.authenticate] },
    createService
  );

  app.get(
    "/listServices/:establishment_id",
    { preHandler: [app.authenticate] },
    getServices
  );

  app.patch(
    "/updateService/:service_id",
    { preHandler: [app.authenticate] },
    updateService
  );

  app.delete(
    "/deleteService/:service_id",
    { preHandler: [app.authenticate] },
    deleteService
  );
}
