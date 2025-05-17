import {
  createService,
  deleteService,
  getServiceById,
  getServices,
} from "@/http/controllers/service.controller";
import { FastifyTypedInstance } from "@/types";

export function servicesRoutes(app: FastifyTypedInstance) {
  app.post("/register", { preHandler: [app.authenticate] }, createService);

  app.get("/list", { preHandler: [app.authenticate] }, getServices);

  app.get("/:id", { preHandler: [app.authenticate] }, getServiceById);

  app.delete("/:id", { preHandler: [app.authenticate] }, deleteService);
}
