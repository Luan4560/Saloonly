import { registerSalonSchemaResponse } from "@/schemas";
import { registerSalon } from "./controllers/register-salon";
import { FastifyTypedInstance } from "@/types";
import { createUser, getUsers, login, logout } from "./controllers/user";
import {
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
} from "@/schemas/user.schema";

export async function salonRoutes(app: FastifyTypedInstance) {
  app.post("/", registerSalonSchemaResponse, registerSalon);
}

export async function userRoutes(app: FastifyTypedInstance) {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
    },
    getUsers
  );
  app.post(
    "/register",
    {
      schema: {
        body: createUserSchema,
        response: {
          201: createUserResponseSchema,
        },
      },
    },
    createUser
  );

  app.post(
    "/login",
    {
      schema: {
        body: loginSchema,
        response: {
          201: loginResponseSchema,
        },
      },
    },
    login
  );

  app.delete("/logout", { preHandler: [app.authenticate] }, logout);

  app.log.info("user routes registered");
}
