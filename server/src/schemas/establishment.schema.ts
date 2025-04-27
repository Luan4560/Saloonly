import { Specialties } from "@prisma/client";
import z from "zod";

export const registerEstablishmentSchemaResponse = {
  schema: {
    tags: ["Establishment"],
    description: "Register a new establishment",
    body: z.object({
      name: z.string(),
      phone: z.string(),
      description: z.string().optional(),
      email: z.string().email(),
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
    }),
    response: {
      201: z.null(),
    },
  },
};

export const registerBodySchemaRequest = z.object({
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
