import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { registerBodySchemaRequest } from "@/schemas";
import { Establishment } from "@prisma/client";

export async function registerEstablishment(
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

  const establishment = await prisma.establishment.create({
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
        establishmentId: establishment.id,
      })),
    });
  }

  return reply.code(201).send();
}

export async function getEstablishments(
  _: FastifyRequest,
  reply: FastifyReply
) {
  const establishments = await prisma.establishment.findMany();

  if (!establishments) {
    return reply.code(404).send({ message: "Establishments not found" });
  }

  return reply.code(200).send(establishments);
}

export async function getEstablishmentById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  const establishment = await prisma.establishment.findUnique({
    where: {
      id: id,
    },
    include: {
      services: true,
      collaborators: true,
    },
  });

  if (!establishment) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  return reply.code(200).send(establishment);
}

export async function updateEstablishment(
  request: FastifyRequest<{ Body: Establishment }>,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const { name, phone, email, address, image } = request.body;

  const isEstablishemntExists = await prisma.establishment.findUnique({
    where: {
      id: id,
    },
  });

  if (!isEstablishemntExists) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  const establishment = await prisma.establishment.update({
    where: {
      id: id,
    },
    data: {
      name,
      phone,
      email,
      address,
      image,
    },
  });

  return reply.code(200).send(establishment);
}

export async function deleteEstablishment(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  const isEstablishemntExists = await prisma.establishment.findUnique({
    where: {
      id: id,
    },
  });

  if (!isEstablishemntExists) {
    return reply.code(404).send({ message: "Establishment not found" });
  }

  await prisma.establishment.delete({
    where: {
      id: id,
    },
  });

  return reply.code(200).send({ message: "Establishment deleted" });
}
