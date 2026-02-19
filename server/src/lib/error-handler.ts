import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma";
import { env } from "@/env";

export function globalErrorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const isProduction = env.NODE_ENV === "production";

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      code: "VALIDATION_ERROR",
      errors: error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const code = (error as Error & { code: string }).code;
    if (code === "P2002") {
      return reply.status(409).send({
        message: "A record with this value already exists",
        code: "CONFLICT",
      });
    }
    if (code === "P2025") {
      return reply.status(404).send({
        message: "Record not found",
        code: "NOT_FOUND",
      });
    }
  }

  const fastifyError = error as FastifyError;
  const statusCode =
    fastifyError.statusCode && fastifyError.statusCode >= 400
      ? fastifyError.statusCode
      : 500;

  const payload: { message: string; code?: string; stack?: string } = {
    message:
      statusCode === 500
        ? "Internal server error"
        : fastifyError.message || "An error occurred",
  };

  if (fastifyError.code) {
    payload.code = fastifyError.code;
  }

  if (!isProduction && error.stack) {
    payload.stack = error.stack;
  }

  return reply.status(statusCode).send(payload);
}
