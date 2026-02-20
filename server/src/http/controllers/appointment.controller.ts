import z from "zod";

import {
  doTimeSlotsOverlap,
  generateSlotsInRange,
  isSlotWithinRange,
} from "@/utils/time";
import { FastifyReply, FastifyRequest } from "fastify";
import { Status } from "@/lib/prisma";
import { WorkingDaysEnum } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { sendAppointmentConfirmationEmail } from "@/lib/nodemailer";
import { paginationSkipTake } from "@/schemas/pagination.schema";
import {
  appointmentSchema,
  getAppointmentsQuerySchema,
  getAvailableSlotsQuerySchema,
  updateAppointmentStatusSchema,
} from "@/schemas/appointment.schema";

const DAY_NAMES: WorkingDaysEnum[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function toCivilDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDayOfWeek(d: Date): WorkingDaysEnum {
  return DAY_NAMES[d.getUTCDay()]!;
}

export type CreateAppointmentsPayload = {
  establishment_id: string;
  collaborator_id: string;
  service_ids: string[];
  workingDays: z.infer<typeof appointmentSchema>["workingDays"];
  user_id?: string | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
};

export async function createAppointmentsWithPayload(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: CreateAppointmentsPayload,
) {
  const {
    establishment_id,
    collaborator_id,
    service_ids,
    workingDays,
    user_id: payloadUserId,
    guest_name,
    guest_email,
    guest_phone,
  } = payload;

  const user_id = payloadUserId ?? undefined;
  const isGuest = !user_id;

  if (isGuest) {
    if (!guest_name || !guest_email || !guest_phone) {
      return reply.code(400).send({
        message:
          "Guest booking requires guest_name, guest_email and guest_phone",
      });
    }
  }

  const user = user_id
    ? await prisma.user.findUnique({ where: { id: user_id } })
    : null;

  let effectiveUserId = user_id ?? undefined;
  if (user_id && !user) {
    if (guest_name && guest_email && guest_phone) {
      effectiveUserId = undefined; // fallback to guest when user not found
    } else {
      return reply.code(400).send({
        message: "User not found",
      });
    }
  }

    const dates = workingDays.map((d) => d.appointment_date);
    const minD = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxD = new Date(Math.max(...dates.map((d) => d.getTime())));
    const [establishmentWorkingDays, establishmentSpecialDates] =
      await Promise.all([
        prisma.workingDay.findMany({
          where: { establishment_id, collaborator_id: null },
        }),
        prisma.specialDate.findMany({
          where: {
            establishment_id,
            date: { gte: minD, lte: maxD },
          },
        }),
      ]);

    for (const day of workingDays) {
      const dayKey = toCivilDateKey(day.appointment_date);
      const special = establishmentSpecialDates.find(
        (s) => toCivilDateKey(s.date) === dayKey,
      );
      if (special?.is_closed) {
        return reply.code(400).send({
          message: `O estabelecimento está fechado na data ${dayKey}.`,
        });
      }
      const establishmentHours = establishmentWorkingDays.find(
        (w) => w.day_of_week === day.day_of_week,
      );
      if (!establishmentHours) {
        return reply.code(400).send({
          message: `O estabelecimento não atende no dia ${day.day_of_week}.`,
        });
      }
      if (
        !isSlotWithinRange(
          day.open_time,
          day.close_time,
          establishmentHours.open_time,
          establishmentHours.close_time,
        )
      ) {
        return reply.code(400).send({
          message: `O horário do agendamento (${day.open_time}-${day.close_time}) está fora do expediente do estabelecimento (${establishmentHours.open_time}-${establishmentHours.close_time}) para ${day.day_of_week}.`,
        });
      }
      if (special?.open_time != null && special?.close_time != null) {
        if (
          !isSlotWithinRange(
            day.open_time,
            day.close_time,
            special.open_time,
            special.close_time,
          )
        ) {
          return reply.code(400).send({
            message: `O horário do agendamento está fora do expediente especial na data ${dayKey}.`,
          });
        }
      }
    }

    for (let i = 0; i < workingDays.length; i++) {
      for (let j = i + 1; j < workingDays.length; j++) {
        const a = workingDays[i];
        const b = workingDays[j];
        if (
          toCivilDateKey(a.appointment_date) !==
          toCivilDateKey(b.appointment_date)
        )
          continue;
        if (
          doTimeSlotsOverlap(
            a.open_time,
            a.close_time,
            b.open_time,
            b.close_time,
          )
        ) {
          return reply.code(409).send({
            message:
              "Não é permitido dois agendamentos no mesmo horário para o mesmo colaborador.",
          });
        }
      }
    }

    const startOfMin = new Date(
      Date.UTC(
        minD.getUTCFullYear(),
        minD.getUTCMonth(),
        minD.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const endOfMax = new Date(
      Date.UTC(
        maxD.getUTCFullYear(),
        maxD.getUTCMonth(),
        maxD.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const servicesList = await prisma.service.findMany({
      where: { id: { in: service_ids } },
      select: { id: true, duration: true },
    });
    if (servicesList.length !== service_ids.length) {
      return reply.code(400).send({
        message: "Um ou mais serviços não foram encontrados.",
      });
    }

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        collaborator_id,
        appointment_date: { gte: startOfMin, lte: endOfMax },
        status: { in: [Status.PENDING, Status.CONFIRMED] },
      },
      select: { appointment_date: true, open_time: true, close_time: true },
    });

    for (const day of workingDays) {
      const dayKey = toCivilDateKey(day.appointment_date);
      for (const existing of existingAppointments) {
        if (toCivilDateKey(existing.appointment_date) !== dayKey) continue;
        if (
          doTimeSlotsOverlap(
            day.open_time,
            day.close_time,
            existing.open_time,
            existing.close_time,
          )
        ) {
          return reply.code(409).send({
            message:
              "Não é permitido dois agendamentos no mesmo horário para o mesmo colaborador.",
          });
        }
      }
    }

    const appointments = await Promise.all(
      workingDays.map(async (day) => {
        return prisma.appointment.create({
          data: {
            user_id: effectiveUserId ?? undefined,
            establishment_id,
            collaborator_id,
            day_of_week: day.day_of_week,
            open_time: day.open_time,
            close_time: day.close_time,
            appointment_date: day.appointment_date,
            guest_name: guest_name ?? undefined,
            guest_email: guest_email ?? undefined,
            guest_phone: guest_phone ?? undefined,
            services: { connect: service_ids.map((id) => ({ id })) },
          },
          include: {
            establishment: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                description: true,
                image: true,
                latitude: true,
                longitude: true,
              },
            },
            collaborator: true,
            services: {
              select: {
                id: true,
                description: true,
                price: true,
                duration: true,
              },
            },
          },
        });
      }),
    );

    const first = appointments[0];
    const toEmail = user?.email ?? guest_email!;
    const userName = user?.name ?? guest_name ?? null;
    if (first?.establishment && first?.collaborator && toEmail) {
      try {
        await sendAppointmentConfirmationEmail({
          toEmail,
          userName,
          establishmentName: first.establishment.name,
          collaboratorName: first.collaborator.name,
          slots: appointments.map((a) => ({
            date: toCivilDateKey(a.appointment_date),
            open_time: a.open_time,
            close_time: a.close_time,
          })),
          serviceNames: first.services
            .map((s) => s.description || `Serviço ${s.id}`)
            .join(", "),
        });
      } catch (emailErr) {
        request.log.warn(
          { err: emailErr, userId: effectiveUserId },
          "Failed to send appointment confirmation email",
        );
      }
    }

    return reply.code(201).send({
      message: "Appointments created successfully",
      appointments,
    });
}

export async function createAppointment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parsed = appointmentSchema.parse(request.body);
    const { establishment_id, collaborator_id, service_ids, workingDays } =
      parsed;
    const user_id = parsed.user_id ?? request.user?.id;
    if (!user_id) {
      return reply.code(400).send({
        message: "User not found or not authenticated",
      });
    }
    return createAppointmentsWithPayload(request, reply, {
      establishment_id,
      collaborator_id,
      service_ids,
      workingDays,
      user_id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return reply.code(400).send({
        message: "Validation error",
        errors: formattedErrors,
      });
    }
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAvailableSlots(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const query = getAvailableSlotsQuerySchema.parse(request.query);
    const {
      establishment_id,
      date,
      collaborator_id,
      slot_duration_minutes,
    } = query;

    const dayOfWeek = getDayOfWeek(date);
    const dayStart = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const dayEnd = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const [establishmentWorkingDays, specialDates, collaborators] =
      await Promise.all([
        prisma.workingDay.findMany({
          where: { establishment_id, collaborator_id: null },
        }),
        prisma.specialDate.findMany({
          where: {
            establishment_id,
            date: { gte: dayStart, lte: dayEnd },
          },
        }),
        collaborator_id
          ? prisma.collaborator.findMany({
              where: { id: collaborator_id, establishment_id },
              select: { id: true },
            })
          : prisma.collaborator.findMany({
              where: { establishment_id },
              select: { id: true },
            }),
      ]);

    const establishmentHours = establishmentWorkingDays.find(
      (w) => w.day_of_week === dayOfWeek,
    );
    const special = specialDates.find(
      (s) => toCivilDateKey(s.date) === toCivilDateKey(date),
    );

    if (special?.is_closed) {
      return reply.code(200).send({
        date: toCivilDateKey(date),
        slots: [],
      });
    }

    const openTime = special?.open_time ?? establishmentHours?.open_time;
    const closeTime = special?.close_time ?? establishmentHours?.close_time;

    if (!openTime || !closeTime) {
      return reply.code(200).send({
        date: toCivilDateKey(date),
        slots: [],
      });
    }

    if (collaborators.length === 0) {
      return reply.code(200).send({
        date: toCivilDateKey(date),
        slots: generateSlotsInRange(
          openTime,
          closeTime,
          slot_duration_minutes,
        ),
      });
    }

    const collaboratorIds = collaborators.map((c) => c.id);
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        establishment_id,
        collaborator_id: { in: collaboratorIds },
        appointment_date: { gte: dayStart, lte: dayEnd },
        status: { in: [Status.PENDING, Status.CONFIRMED] },
      },
      select: { open_time: true, close_time: true, collaborator_id: true },
    });

    const allSlots = generateSlotsInRange(
      openTime,
      closeTime,
      slot_duration_minutes,
    );

    const freeSlots = allSlots.filter((slot) => {
      const isFreeForSomeCollaborator = collaboratorIds.some((cid) => {
        const occupiedForCollaborator = existingAppointments.filter(
          (a) => a.collaborator_id === cid,
        );
        const overlaps = occupiedForCollaborator.some((app) =>
          doTimeSlotsOverlap(
            slot.open_time,
            slot.close_time,
            app.open_time,
            app.close_time,
          ),
        );
        return !overlaps;
      });
      return isFreeForSomeCollaborator;
    });

    return reply.code(200).send({
      date: toCivilDateKey(date),
      slots: freeSlots,
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

export async function getAppointments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const establishmentId =
      request.user?.establishment_id ??
      (request.query as { establishment_id?: string })?.establishment_id;
    const queryResult = getAppointmentsQuerySchema.safeParse(request.query);
    type Query = z.infer<typeof getAppointmentsQuerySchema>;
    const query: Partial<Query> = queryResult.success ? queryResult.data : {};
    const { skip, take } = paginationSkipTake({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    const where: {
      establishment_id?: string;
      status?: Status;
      appointment_date?: { gte?: Date; lte?: Date };
    } = {};
    if (establishmentId) where.establishment_id = establishmentId;
    if (query.status) where.status = query.status;
    if (query.date_from ?? query.date_to) {
      where.appointment_date = {};
      if (query.date_from) where.appointment_date.gte = query.date_from;
      if (query.date_to) where.appointment_date.lte = query.date_to;
    }

    const appointments = await prisma.appointment.findMany({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
      include: {
        collaborator: true,
        establishment: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            description: true,
            image: true,
            latitude: true,
            longitude: true,
          },
        },
        services: {
          select: {
            id: true,
            description: true,
            price: true,
            duration: true,
          },
        },
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    return reply.code(200).send(appointments);
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

const appointmentInclude = {
  collaborator: true,
  establishment: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      description: true,
      image: true,
      latitude: true,
      longitude: true,
    },
  },
  services: {
    select: {
      id: true,
      description: true,
      price: true,
      duration: true,
    },
  },
};

export async function getAppointmentById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: appointmentInclude,
    });

    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    const establishmentId = request.user?.establishment_id;
    if (establishmentId && appointment.establishment_id !== establishmentId) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    return reply.code(200).send(appointment);
  } catch (error) {
    return reply.code(500).send({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updateAppointmentStatus(
  request: FastifyRequest<{
    Params: { id: string };
    Body: z.infer<typeof updateAppointmentStatusSchema>;
  }>,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params;
    const { status } = updateAppointmentStatusSchema.parse(request.body);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    const establishmentId = request.user?.establishment_id;
    if (establishmentId && appointment.establishment_id !== establishmentId) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: appointmentInclude,
    });
    return reply.code(200).send(updated);
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
