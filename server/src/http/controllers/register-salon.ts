
import {FastifyRequest, FastifyReply} from "fastify"
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export async function registerSalon (request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().email(),
      services: z.string().array().nonempty(),
      address: z.string(),
      image: z.string(),
      password_hash: z.string().min(6),
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
    })
  
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
    } = registerBodySchema.parse(request.body)
  
    await prisma.salon.create({
      data: {
        id: randomUUID(),
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
      }
    })
  
    return reply.status(201).send()
  
  }