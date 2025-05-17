import { prisma } from '@/lib/prisma'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function createAppointment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
  // criar a agendamento 
  console.log(request.body)


    return reply.code(201).send()
  } catch (error) {
    return reply.code(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export async function getAppointments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        collaborator: true,
      },
    })

    return reply.code(200).send(appointments)
  } catch (error) {
    return reply.code(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
