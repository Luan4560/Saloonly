import { createService } from "@/http/controllers/service.controller";
import { FastifyTypedInstance } from "@/types";

export function servicesRoutes(app: FastifyTypedInstance) {
  app.post(
    "/createServices",
    { preHandler: [app.authenticate] },
    createService
  );
}
