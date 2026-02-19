import z from "zod";

import { FastifyTypedInstance } from "@/types";
import { loginUserSchema } from "@/schemas/user.schema";
import {
  createUser,
  getMe,
  getUsers,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateMe,
} from "@/http/controllers/user.controller";
import {
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  loginResponseSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "@/schemas/user.schema";
import { paginationQuerySchema } from "@/schemas/pagination.schema";

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

  app.patch(
    "/me",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["User"],
        description: "Update current user profile (name and/or email)",
        body: updateProfileSchema,
        response: {
          200: loginUserSchema,
        },
      },
    },
    updateMe,
  );

  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      schema: {
        tags: ["User"],
        description: "Get all users",
        querystring: paginationQuerySchema,
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
      config: {
        rateLimit: { max: 10, timeWindow: "15 minutes" },
      },
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
      config: {
        rateLimit: { max: 10, timeWindow: "15 minutes" },
      },
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
      config: {
        rateLimit: { max: 5, timeWindow: "15 minutes" },
      },
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
      config: {
        rateLimit: { max: 5, timeWindow: "15 minutes" },
      },
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
