import { createAppointment } from "@/http/controllers/appointment.controller";
import { FastifyTypedInstance } from "@/types";

export async function appointmentRoutes(app: FastifyTypedInstance) {
  app.post("/createAppointment", {preHandler: [app.authenticate]}, createAppointment)
}