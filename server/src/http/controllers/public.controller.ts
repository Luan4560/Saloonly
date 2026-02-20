import z from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { paginationSkipTake } from "@/schemas/pagination.schema";
import { getAvailableSlots } from "./appointment.controller";
import { getAvailableSlotsQuerySchema } from "@/schemas/appointment.schema";
import {
  searchEstablishmentsQuerySchema,
  getPublicEstablishmentParamsSchema,
  getAvailableSlotsPublicQuerySchema,
} from "@/schemas/public.schema";

const publicEstablishmentSelect = {
  id: true,
  name: true,
  phone: true,
  description: true,
  email: true,
  address: true,
  image: true,
  latitude: true,
  longitude: true,
  establishment_type: true,
  created_at: true,
  updated_at: true,
} as const;

export async function searchEstablishments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = searchEstablishmentsQuerySchema.parse(request.query ?? {});
    const { skip, take } = paginationSkipTake(query);
    const { name, type, address } = query;

    const where: {
      name?: { contains: string; mode: "insensitive" };
      establishment_type?: typeof type;
      address?: { contains: string; mode: "insensitive" };
    } = {};
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (type) where.establishment_type = type;
    if (address) where.address = { contains: address, mode: "insensitive" };

    const establishments = await prisma.establishment.findMany({
      where: Object.keys(where).length ? where : undefined,
      select: {
        ...publicEstablishmentSelect,
        WorkingDay: {
          where: { collaborator_id: null },
          select: { day_of_week: true, open_time: true, close_time: true },
        },
        SpecialDate: {
          select: {
            date: true,
            is_closed: true,
            open_time: true,
            close_time: true,
          },
        },
      },
      skip,
      take,
    });

    const result = establishments.map((e) => ({
      ...e,
      workingDays: e.WorkingDay,
      specialDates: e.SpecialDate,
      WorkingDay: undefined,
      SpecialDate: undefined,
    }));

    return reply.code(200).send(result);
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

export async function getPublicEstablishmentById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { id } = getPublicEstablishmentParamsSchema.parse(request.params);

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      select: {
        ...publicEstablishmentSelect,
        WorkingDay: {
          where: { collaborator_id: null },
          select: { day_of_week: true, open_time: true, close_time: true },
        },
        SpecialDate: {
          select: {
            date: true,
            is_closed: true,
            open_time: true,
            close_time: true,
          },
        },
        Service: {
          where: { active: true },
          select: {
            id: true,
            description: true,
            price: true,
            duration: true,
            establishment_type: true,
          },
        },
        Collaborator: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    if (!establishment) {
      return reply.code(404).send({ message: "Establishment not found" });
    }

    const { WorkingDay, SpecialDate, Service, Collaborator, ...rest } =
      establishment;
    return reply.code(200).send({
      ...rest,
      workingDays: WorkingDay,
      specialDates: SpecialDate,
      services: Service,
      collaborators: Collaborator,
    });
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

export async function getPublicEstablishmentServices(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { id } = getPublicEstablishmentParamsSchema.parse(request.params);

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!establishment) {
      return reply.code(404).send({ message: "Establishment not found" });
    }

    const services = await prisma.service.findMany({
      where: { establishment_id: id, active: true },
      select: {
        id: true,
        description: true,
        price: true,
        duration: true,
        establishment_type: true,
      },
    });

    return reply.code(200).send(services);
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

export async function getPublicEstablishmentCollaborators(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { id } = getPublicEstablishmentParamsSchema.parse(request.params);

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!establishment) {
      return reply.code(404).send({ message: "Establishment not found" });
    }

    const collaborators = await prisma.collaborator.findMany({
      where: { establishment_id: id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    return reply.code(200).send(collaborators);
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

export async function getPublicEstablishmentAvailableSlots(
  request: FastifyRequest<{
    Params: { id: string };
    Querystring: z.infer<typeof getAvailableSlotsPublicQuerySchema>;
  }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const query = getAvailableSlotsPublicQuerySchema.safeParse(request.query);
  if (!query.success) {
    return reply.code(400).send({
      message: "Validation error",
      errors: query.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
  }
  const { date, collaborator_id, slot_duration_minutes } = query.data;
  const mergedQuery = getAvailableSlotsQuerySchema.parse({
    establishment_id: id,
    date,
    collaborator_id,
    slot_duration_minutes,
  });
  const fakeRequest = {
    ...request,
    query: mergedQuery,
  } as FastifyRequest;
  return getAvailableSlots(fakeRequest, reply);
}
