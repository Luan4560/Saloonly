import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { Specialties } from "@prisma/client";

export async function registerSalon(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const registerBodySchema = z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    address: z.string(),
    image: z.string(),
    password_hash: z.string().min(6),
    description: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    opening_hours: z.array(
      z.object({
        days: z.array(z.string()),
        open: z.boolean(),
        open_time: z.string().nullable(),
        close_time: z.string().nullable(),
      })
    ),
    services: z
      .array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          price: z.number(),
          duration: z.number(),
          establishmentType: z.enum(["BARBERSHOP", "BEAUTY_SALON"]),
          serviceType: z.enum([
            "MALE_HAIRCUT",
            "BEARD_TRIM_STYLING",
            "FADE",
            "MALE_EYEBROW_SHAPING",
            "MALE_HAIR_COLORING",
            "FEMALE_HAIRCUT",
            "MANICURE_PEDICURE",
            "BLOWOUT_STRAIGHTENING",
            "FEMALE_HAIR_COLORING",
            "EYEBROW_DESIGN",
          ]),
          active: z.boolean().default(true),
        })
      )
      .optional(),
    collaborators: z
      .array(
        z.object({
          name: z.string(),
          phone: z.string(),
          email: z.string().email(),
          specialties: z.array(z.nativeEnum(Specialties)),
          price: z.number(),
          avatar: z.string(),
          working_days: z.array(z.string()),
          working_hours: z.array(z.string()),
          role: z.enum(["ADMIN", "COLLABORATOR"]).default("COLLABORATOR"),
        })
      )
      .optional(),
  });

  const {
    name,
    phone,
    email,
    services,
    address,
    image,
    password_hash,
    latitude,
    longitude,
    opening_hours,
    collaborators,
  } = registerBodySchema.parse(request.body);

  await prisma.salon.create({
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
      services: {
        create: services,
      },
    },
  });

  return reply.status(201).send();
}
