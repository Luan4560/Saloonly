import {
  createService,
  deleteService,
  getServiceById,
  getServices,
} from "@/http/controllers/service.controller";
import { FastifyTypedInstance } from "@/types";

export function servicesRoutes(app: FastifyTypedInstance) {
  app.post(
    "/createServices",
    { preHandler: [app.authenticate] },
    createService
  );

  app.get("/getServices", { preHandler: [app.authenticate] }, getServices);

  app.get(
    "/getServiceById/:id",
    { preHandler: [app.authenticate] },
    getServiceById
  );

  app.delete(
    "/deleteService/:id",
    { preHandler: [app.authenticate] },
    deleteService
  );
}
