import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { registerBodySchemaRequest } from "@/schemas";

export async function registerSalon(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {
    name,
    phone,
    email,
    address,
    image,
    password_hash,
    latitude,
    longitude,
    opening_hours,
    services,
  } = registerBodySchemaRequest.parse(request.body);

  const salon = await prisma.salon.create({
    data: {
      id: randomUUID(),
      name,
      phone,
      email,
      address,
      image,
      password_hash,
      latitude,
      longitude,
      opening_hours,
    },
  });

  if (services && services.length > 0) {
    await prisma.services.createMany({
      data: services.map((service) => ({
        ...service,
        salonId: salon.id,
      })),
    });
  }

  return reply.code(201).send();
}
