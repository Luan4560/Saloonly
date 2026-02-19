import {
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/user.schema";
import { FastifyTypedInstance } from "@/types";
import {
  createUser,
  getMe,
  getUsers,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "@/http/controllers/user.controller";
import { loginUserSchema } from "@/schemas/user.schema";
import z from "zod";

export async function userRoutes(app: FastifyTypedInstance) {
  app.get(
    "/me",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["User"],
        description: "Get current authenticated user",
        response: {
          200: loginUserSchema,
        },
      },
    },
    getMe,
  );

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
    getUsers,
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
    createUser,
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
    login,
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
    logout,
  );

  app.post(
    "/forgot-password",
    {
      schema: {
        tags: ["User"],
        description: "Request password reset",
        body: forgotPasswordSchema,
      },
    },
    forgotPassword,
  );

  app.post(
    "/reset-password",
    {
      schema: {
        tags: ["User"],
        description: "Reset password with token",
        body: resetPasswordSchema,
      },
    },
    resetPassword,
  );

  app.log.info("user routes registered");
}
