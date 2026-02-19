import { WorkingDaysEnum } from "@/lib/prisma";
import z from "zod";

const firstLetterLower = (val: unknown) =>
  typeof val === "string" && val.length > 0
    ? val.charAt(0).toLowerCase() + val.slice(1)
    : val;

const collaboratorResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  role: z.enum(["ADMIN", "COLLABORATOR"]),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  establishment_id: z.string().nullable().optional(),
});

const serviceResponseSchema = z.object({
  id: z.string(),
  description: z.string().nullable().optional(),
  price: z.union([z.number(), z.string()]),
  duration: z.number(),
  establishment_type: z.enum(["BARBERSHOP", "BEAUTY_SALON"]),
  active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  establishment_id: z.string().nullable().optional(),
});

const workingDayResponseSchema = z.object({
  id: z.string(),
  day_of_week: z.nativeEnum(WorkingDaysEnum),
  open_time: z.string(),
  close_time: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  establishment_id: z.string(),
  collaborator_id: z.string().nullable().optional(),
});

const specialDateResponseSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  is_closed: z.boolean(),
  open_time: z.string().nullable().optional(),
  close_time: z.string().nullable().optional(),
  establishment_id: z.string(),
});

export const registerEstablishmentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  description: z.string().nullable().optional(),
  email: z.string(),
  address: z.string(),
  image: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  collaborator: z.array(collaboratorResponseSchema),
  service: z.array(serviceResponseSchema),
  workingDay: z.array(workingDayResponseSchema),
  specialDate: z.array(specialDateResponseSchema),
});

const registerEstablishmentUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.string(),
  establishment_id: z.string(),
});

export const registerEstablishmentFullResponseSchema =
  registerEstablishmentResponseSchema.extend({
    accessToken: z.string().optional(),
    user: registerEstablishmentUserResponseSchema.optional(),
  });

const serviceSchema = z
  .array(
    z.object({
      description: z.string().optional(),
      price: z.number({
        required_error: "Price is required",
      }),
      duration: z.number({
        required_error: "Duration is required",
      }),
      establishment_type: z.enum(["BARBERSHOP", "BEAUTY_SALON"]),
      active: z.boolean().default(true),
    }),
  )
  .optional();

const workingDaysSchema = z.array(
  z.object({
    day_of_week: z.nativeEnum(WorkingDaysEnum, {
      required_error: "Day of week is required",
    }),
    open_time: z
      .string({ required_error: "Open time is required" })
      .transform((val) => firstLetterLower(val) as string),
    close_time: z
      .string({ required_error: "Close time is required" })
      .transform((val) => firstLetterLower(val) as string),
  }),
);

const specialDateSchema = z.array(
  z.object({
    date: z.coerce.date({
      required_error: "Date is required",
    }),
    is_closed: z.boolean().default(false),
    open_time: z
      .string()
      .optional()
      .transform((val): string | undefined =>
        val === undefined ? undefined : (firstLetterLower(val) as string),
      ),
    close_time: z
      .string()
      .optional()
      .transform((val): string | undefined =>
        val === undefined ? undefined : (firstLetterLower(val) as string),
      ),
  }),
);

const collaboratorSchema = z
  .array(
    z.object({
      name: z.string({ required_error: "Name is required" }),
      phone: z
        .string({ required_error: "Phone is required" })
        .transform((val) => firstLetterLower(val) as string),
      email: z.string({ required_error: "Email is required" }).email(),
      avatar: z.string().optional(),
      role: z.enum(["ADMIN", "COLLABORATOR"]).default("COLLABORATOR"),
    }),
  )
  .optional();

export const updateEstablishmentSchema = z.object({
  name: z.string().optional(),
  phone: z
    .string()
    .optional()
    .transform((val) => firstLetterLower(val)),
  email: z.string().email().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
  workingDays: workingDaysSchema.optional(),
  specialDates: specialDateSchema.optional(),
});

export type UpdateEstablishmentInput = z.infer<
  typeof updateEstablishmentSchema
>;

export const registerEstablishmentSchemaResponse = {
  schema: {
    tags: ["Establishment"],
    description: "Register a new establishment",
    body: z.object({
      name: z.string({ required_error: "Name is required" }),
      phone: z
        .string({ required_error: "Phone is required" })
        .transform((val) => firstLetterLower(val) as string),
      description: z.string().optional(),
      email: z.string({ required_error: "Email is required" }).email(),
      address: z.string({ required_error: "Address is required" }),
      image: z.string({ required_error: "Image is required" }),
      password: z.string({ required_error: "Password is required" }).min(6),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      workingDays: workingDaysSchema,
      specialDates: specialDateSchema.optional(),
      collaborators: collaboratorSchema,
      services: serviceSchema,
    }),
  },
};
