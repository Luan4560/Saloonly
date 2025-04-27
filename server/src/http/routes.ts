import { registerEstablishmentSchemaResponse } from "@/schemas";
import {
  deleteEstablishment,
  getEstablishmentById,
  getEstablishments,
  registerEstablishment,
  updateEstablishment,
} from "./controllers/establishment.controller";
import { FastifyTypedInstance } from "@/types";
import {
  createUser,
  getUsers,
  login,
  logout,
} from "./controllers/user.controller";
import {
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
} from "@/schemas/user.schema";

export async function establishmentRoutes(app: FastifyTypedInstance) {
  app.post(
    "/register",
    {
      preHandler: [app.authenticate],
      schema: registerEstablishmentSchemaResponse.schema,
    },
    registerEstablishment
  );

  app.get("/list", { preHandler: [app.authenticate] }, getEstablishments);

  app.get("/:id", { preHandler: [app.authenticate] }, getEstablishmentById);

  app.patch("/:id", { preHandler: [app.authenticate] }, updateEstablishment);

  app.delete("/:id", { preHandler: [app.authenticate] }, deleteEstablishment);
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
