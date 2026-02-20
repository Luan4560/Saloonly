import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import z from "zod";

import bcrypt from "bcryptjs";
import { env } from "@/env";
import {
  registerEstablishmentSchemaResponse,
  updateEstablishmentSchema,
} from "@/schemas/establishment.schema";
import {
  paginationQuerySchema,
  paginationSkipTake,
  type PaginationQuery,
} from "@/schemas/pagination.schema";

const SALT_ROUNDS = 10;

const transformObjectKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(transformObjectKeys);
  }

  if (obj !== null && typeof obj === "object") {
    if (Object.getPrototypeOf(obj) !== Object.prototype) {
      return obj;
    }
    const transformed: any = {};
    for (const key in obj) {
      const newKey = key.charAt(0).toLowerCase() + key.slice(1);
      transformed[newKey] = transformObjectKeys(obj[key]);
    }
    return transformed;
  }

  return obj;
};

export async function registerEstablishment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const establishmentParseResult =
      registerEstablishmentSchemaResponse.schema.body.safeParse(request.body);

    if (!establishmentParseResult.success) {
      const formattedErrors = establishmentParseResult.error.errors.map(
        (err) => ({
          field: err.path.join("."),
          message: err.message,
        }),
      );

      return reply.code(400).send({
        message: "Validation error",
        errors: formattedErrors,
      });
    }

    const {
      workingDays,
      specialDates,
      collaborators,
      services,
      password,
      ...establishmentData
    } = establishmentParseResult.data;

    if (request.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { establishment_id: true },
      });
      if (user?.establishment_id) {
        return reply.code(403).send({
          message:
            "Your account is already linked to an establishment. Each account can only have one establishment.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const existingEstablishment = await prisma.establishment.findFirst({
      where: {
        OR: [
          { phone: establishmentData.phone },
          { email: establishmentData.email },
        ],
      },
    });

    if (existingEstablishment) {
      if (existingEstablishment.phone === establishmentData.phone) {
        return reply.code(400).send({
          message: "An establishment with this phone number already exists",
        });
      }
      if (existingEstablishment.email === establishmentData.email) {
        return reply.code(400).send({
          message: "An establishment with this email already exists",
        });
      }
    }

    const establishment = await prisma.establishment.create({
      data: {
        ...establishmentData,
        password_hash: hashedPassword,
        Collaborator: {
          create: collaborators?.map((collaborator) => ({
            name: collaborator.name,
            phone: collaborator.phone,
            email: collaborator.email,
            avatar: collaborator.avatar,
            role: collaborator.role,
          })),
        },
        WorkingDay: {
          create: workingDays.map((day) => ({
            day_of_week: day.day_of_week,
            open_time: day.open_time,
            close_time: day.close_time,
          })),
        },
        SpecialDate: {
          create: specialDates?.map((date) => ({
            date: date.date,
            is_closed: date.is_closed,
            open_time: date.open_time,
            close_time: date.close_time,
          })),
        },
        Service: {
          create: services?.map((service) => ({
            description: service.description,
            price: service.price,
            duration: service.duration,
            establishment_type: service.establishment_type,
            active: service.active,
          })),
        },
      },
      include: {
        Collaborator: true,
        Service: true,
        WorkingDay: true,
        SpecialDate: true,
      },
    });

    let accessToken: string | undefined;
    let userResponse: { id: string; email: string; name: string | null; role: string; establishment_id: string } | undefined;

    if (request.user?.id) {
      const updatedUser = await prisma.user.update({
        where: { id: request.user.id },
        data: { establishment_id: establishment.id },
        select: { id: true, email: true, name: true, role: true },
      });
      const payload = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        establishment_id: establishment.id,
        role: updatedUser.role,
      };
      const token = request.jwt.sign(payload);
      reply.setCookie("access_token", token, {
        path: "/",
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
      });
      accessToken = token;
      userResponse = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        establishment_id: establishment.id,
      };
    }

    const {
      password_hash: _hash,
      salt: _salt,
      ...establishmentWithoutSecrets
    } = establishment;
    const body = transformObjectKeys(establishmentWithoutSecrets) as Record<string, unknown>;
    if (accessToken && userResponse) {
      body.accessToken = accessToken;
      body.user = userResponse;
    }
    return reply
      .code(201)
      .send(body);
  } catch (error) {
    request.log.error(error, "Error creating establishment");
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEstablishments(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) {
  try {
    const query = paginationQuerySchema.parse(request.query ?? {});
    const { skip, take } = paginationSkipTake(query);
    const isPlatformAdmin = request.user?.role === "ADMIN";
    let establishmentId: string | undefined = request.user?.establishment_id;
    if (request.user?.id && !isPlatformAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { establishment_id: true },
      });
      if (user?.establishment_id) establishmentId = user.establishment_id;
    }
    if (!isPlatformAdmin && !establishmentId) {
      return reply.code(200).send([]);
    }
    const establishments = await prisma.establishment.findMany({
      where: isPlatformAdmin ? {} : { id: establishmentId },
      include: {
        Collaborator: true,
        Service: true,
        WorkingDay: true,
        SpecialDate: true,
      },
      skip,
      take,
    });

    if (!establishments || establishments.length === 0) {
      return reply.code(200).send([]);
    }

    return reply.code(200).send(transformObjectKeys(establishments));
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEstablishmentById(
  request: FastifyRequest<{ Params: { establishment_id: string } }>,
  reply: FastifyReply,
) {
  const { establishment_id } = request.params;
  const userEstablishmentId = request.user?.establishment_id;
  const isPlatformAdmin = request.user?.role === "ADMIN";
  if (
    !isPlatformAdmin &&
    userEstablishmentId &&
    userEstablishmentId !== establishment_id
  ) {
    return reply.code(403).send({ message: "Forbidden" });
  }

  const establishment = await prisma.establishment.findUnique({
    where: {
      id: establishment_id,
    },
    include: {
      Collaborator: true,
      Service: true,
      WorkingDay: { where: { collaborator_id: null } },
      SpecialDate: true,
    },
  });

  if (!establishment) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  return reply.code(200).send(transformObjectKeys(establishment));
}

export async function updateEstablishment(
  request: FastifyRequest<{ Params: { establishment_id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { establishment_id } = request.params;
    const userEstablishmentId = request.user?.establishment_id;
    const isPlatformAdmin = request.user?.role === "ADMIN";
    if (
      !isPlatformAdmin &&
      userEstablishmentId &&
      userEstablishmentId !== establishment_id
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }
    const body = updateEstablishmentSchema.parse(request.body);

    const isEstablishmentExists = await prisma.establishment.findUnique({
      where: {
        id: establishment_id,
      },
    });

    if (!isEstablishmentExists) {
      return reply.code(404).send({ message: "Establishment not found" });
    }

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.address !== undefined) data.address = body.address;
    if (body.image !== undefined) data.image = body.image;

    const establishment = await prisma.$transaction(async (tx) => {
      const updated = await tx.establishment.update({
        where: { id: establishment_id },
        data,
        include: {
          Collaborator: true,
          Service: true,
          WorkingDay: true,
          SpecialDate: true,
        },
      });

      if (body.workingDays !== undefined) {
        await tx.workingDay.deleteMany({
          where: {
            establishment_id,
            collaborator_id: null,
          },
        });
        if (body.workingDays.length > 0) {
          await tx.workingDay.createMany({
            data: body.workingDays.map((day) => ({
              establishment_id,
              day_of_week: day.day_of_week,
              open_time: day.open_time,
              close_time: day.close_time,
            })),
          });
        }
      }

      if (body.specialDates !== undefined) {
        await tx.specialDate.deleteMany({
          where: { establishment_id },
        });
        if (body.specialDates.length > 0) {
          await tx.specialDate.createMany({
            data: body.specialDates.map((date) => ({
              establishment_id,
              date: date.date,
              is_closed: date.is_closed,
              open_time: date.open_time,
              close_time: date.close_time,
            })),
          });
        }
      }

      if (body.workingDays !== undefined || body.specialDates !== undefined) {
        return tx.establishment.findUnique({
          where: { id: establishment_id },
          include: {
            Collaborator: true,
            Service: true,
            WorkingDay: true,
            SpecialDate: true,
          },
        });
      }
      return updated;
    });

    const result = establishment!;
    return reply.code(200).send(transformObjectKeys(result));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        message: "Validation error",
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deleteEstablishment(
  request: FastifyRequest<{ Params: { establishment_id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { establishment_id } = request.params;
    const userEstablishmentId = request.user?.establishment_id;
    const isPlatformAdmin = request.user?.role === "ADMIN";
    if (
      !isPlatformAdmin &&
      userEstablishmentId &&
      userEstablishmentId !== establishment_id
    ) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    const isEstablishmentExists = await prisma.establishment.findUnique({
      where: {
        id: establishment_id,
      },
    });

    if (!isEstablishmentExists) {
      return reply.code(404).send({ message: "Establishment not found" });
    }

    await prisma.$transaction([
      prisma.appointment.deleteMany({
        where: { establishment_id },
      }),
      prisma.workingDay.deleteMany({
        where: { establishment_id },
      }),
      prisma.specialDate.deleteMany({
        where: { establishment_id },
      }),
      prisma.service.deleteMany({
        where: { establishment_id },
      }),
      prisma.collaborator.deleteMany({
        where: { establishment_id },
      }),
      prisma.establishment.delete({
        where: { id: establishment_id },
      }),
    ]);

    return reply
      .code(200)
      .send({ message: "Establishment deleted successfully" });
  } catch (error) {
    request.log.error(error, "Error deleting establishment");
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
