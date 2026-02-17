import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} from "@/http/controllers/appointment.controller";
import { FastifyTypedInstance } from "@/types";

export async function appointmentRoutes(app: FastifyTypedInstance) {
  app.post("/register", { preHandler: [app.authenticate] }, createAppointment);

  app.get("/list", { preHandler: [app.authenticate] }, getAppointments);

  app.patch(
    "/:id/status",
    { preHandler: [app.authenticate] },
    updateAppointmentStatus
  );
}
