import {
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
  createUserSchemaResponse,
} from "@/schemas/user.schema";
import { FastifyTypedInstance } from "@/types";
import {
  createUser,
  getUsers,
  login,
  logout,
} from "@/http/controllers/user.controller";
import z from "zod";

export async function userRoutes(app: FastifyTypedInstance) {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["User"],
        description: "Get all users",
        response: {
          200: z.array(createUserResponseSchema),
        },
      },
    },
    getUsers
  );

  app.post(
    "/register",
    {
      schema: {
        tags: ["User"],
        description: "Register a new user",
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
        tags: ["User"],
        description: "Login a user",
        body: loginSchema,
        response: {
          201: loginResponseSchema,
        },
      },
    },
    login
  );

  app.delete(
    "/logout",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["User"],
        description: "Logout a user",
      },
    },
    logout
  );

  app.log.info("user routes registered");
}
