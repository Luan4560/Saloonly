import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { registerEstablishmentSchemaResponse } from "@/schemas/establishment.schema";
import { Establishment } from "@prisma/client";

const transformObjectKeys = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(transformObjectKeys);
  }

  if (obj !== null && typeof obj === "object") {
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
  reply: FastifyReply
) {
  try {
    const establishmentParseResult =
      registerEstablishmentSchemaResponse.schema.body.safeParse(request.body);

    if (!establishmentParseResult.success) {
      const formattedErrors = establishmentParseResult.error.errors.map(
        (err) => ({
          field: err.path.join("."),
          message: err.message,
        })
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
      ...establishmentData
    } = establishmentParseResult.data;

    // Check if establishment with same phone or email already exists
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

    return reply.code(201).send(transformObjectKeys(establishment));
  } catch (error) {
    console.error("Error creating establishment:", error);
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getEstablishments(
  _: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const establishments = await prisma.establishment.findMany({
      include: {
        Collaborator: true,
        Service: true,
        WorkingDay: true,
        SpecialDate: true,
      },
    });

    if (!establishments || establishments.length === 0) {
      return reply.code(404).send({ message: "No establishments found" });
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
  reply: FastifyReply
) {
  const { establishment_id } = request.params;

  const establishment = await prisma.establishment.findUnique({
    where: {
      id: establishment_id,
    },
    include: {
      Collaborator: true,
      Service: true,
      WorkingDay: true,
      SpecialDate: true,
    },
  });

  if (!establishment) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  return reply.code(200).send(transformObjectKeys(establishment));
}

export async function updateEstablishment(
  request: FastifyRequest<{
    Body: Establishment;
    Params: { establishment_id: string };
  }>,
  reply: FastifyReply
) {
  const { establishment_id } = request.params;
  const { name, phone, email, address, image } = request.body;

  const isEstablishemntExists = await prisma.establishment.findUnique({
    where: {
      id: establishment_id,
    },
  });

  if (!isEstablishemntExists) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  const establishment = await prisma.establishment.update({
    where: {
      id: establishment_id,
    },
    data: {
      name,
      phone,
      email,
      address,
      image,
    },
    include: {
      Collaborator: true,
      Service: true,
      WorkingDay: true,
      SpecialDate: true,
    },
  });

  return reply.code(200).send(transformObjectKeys(establishment));
}

export async function deleteEstablishment(
  request: FastifyRequest<{ Params: { establishment_id: string } }>,
  reply: FastifyReply
) {
  try {
    const { establishment_id } = request.params;

    const isEstablishemntExists = await prisma.establishment.findUnique({
      where: {
        id: establishment_id,
      },
    });

    if (!isEstablishemntExists) {
      return reply.code(404).send({ message: "Establishment not found" });
    }

    await prisma.$transaction([
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
    console.error("Error deleting establishment:", error);
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
