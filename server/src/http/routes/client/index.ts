import { z } from "zod";
import { FastifyTypedInstance } from "@/types";
import {
  cancelClientAppointment,
  createClientAppointment,
  clientLogin,
  clientLogout,
  clientRegister,
  getMyAppointments,
} from "@/http/controllers/client.controller";
import {
  clientBookingSchema,
  clientRegisterSchema,
  clientRegisterResponseSchema,
  clientLoginSchema,
  clientLoginResponseSchema,
} from "@/schemas/client.schema";

export async function clientRoutes(app: FastifyTypedInstance) {
  app.post(
    "/auth/register",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "15 minutes" },
      },
      schema: {
        tags: ["Client Auth"],
        description: "Register a new client (role USER)",
        body: clientRegisterSchema,
        response: {
          201: clientRegisterResponseSchema,
        },
      },
    },
    clientRegister,
  );

  app.post(
    "/auth/login",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "15 minutes" },
      },
      schema: {
        tags: ["Client Auth"],
        description: "Login as a client (USER role only)",
        body: clientLoginSchema,
        response: {
          200: clientLoginResponseSchema,
        },
      },
    },
    clientLogin,
  );

  app.post(
    "/auth/logout",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Client Auth"],
        description: "Logout the current client",
        response: {
          200: z.object({ message: z.string() }),
        },
      },
    },
    clientLogout,
  );

  app.post(
    "/appointments",
    {
      preHandler: [app.optionalAuthenticate],
      schema: {
        tags: ["Client Appointments"],
        description:
          "Create an appointment (guest or authenticated). Guests must send guest_name, guest_email, guest_phone.",
        body: clientBookingSchema,
        response: {
          201: z.object({
            message: z.string(),
            appointments: z.array(z.any()),
          }),
        },
      },
    },
    createClientAppointment,
  );

  app.get(
    "/appointments",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Client Appointments"],
        description: "List my appointments (requires auth)",
        response: {
          200: z.array(z.any()),
        },
      },
    },
    getMyAppointments,
  );

  app.patch(
    "/appointments/:id/cancel",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["Client Appointments"],
        description: "Cancel one of my appointments (requires auth)",
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.any(),
        },
      },
    },
    cancelClientAppointment,
  );

  app.log.info("client routes registered");
}
