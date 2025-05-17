import { Specialities, WorkingDaysEnum } from "@prisma/client";
import z from "zod";

const serviceSchema = z
.array(
  z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    description: z.string().optional(),
    price: z.number({
      required_error: "Price is required",
    }),
    duration: z.number({
      required_error: "Duration is required",
    }),
    establishmentType: z.enum(["BARBERSHOP", "BEAUTY_SALON"]),
    active: z.boolean().default(true),
  })
)
.optional()

const workingDaysSchema = z.array(
  z.object({
    dayOfWeek: z.nativeEnum(WorkingDaysEnum, {required_error: "Day of week is required"}),
    openTime: z.string({
      required_error: "Open time is required",
    }),
    closeTime: z.string({
      required_error: "Close time is required",
    }),
  })
)

const specialDateSchema = z.array(
  z.object({
    date: z.coerce.date({
      required_error: "Date is required",
    }),
    isClosed: z.boolean().default(false),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  })
)

const collaboratorSchema = z.array(
  z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    phone: z.string({
      required_error: "Phone is required",
    }),
    email: z.string().email(),
    specialities: z.array(z.nativeEnum(Specialities)).optional(),
    avatar: z.string().optional(),
    role: z.enum(["ADMIN", "COLLABORATOR"]).default("COLLABORATOR"),
  })
).optional()

export const registerEstablishmentSchemaResponse = {
  schema: {
    tags: ["Establishment"],
    description: "Register a new establishment",
    body: z.object({
      name: z.string({
        required_error: "Name is required",
      }),
      phone: z.string({
        required_error: "Phone is required",
      }),
      description: z.string().optional(),
      email: z.string().email(),
      services: serviceSchema,
      address: z.string({
        required_error: "Address is required",
      }),
      image: z.string({
        required_error: "Image is required",
      }),
      password_hash: z.string().min(6),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      workingDays: workingDaysSchema,
      specialDates: specialDateSchema,
      collaborators: collaboratorSchema,
    }),
  },
};

