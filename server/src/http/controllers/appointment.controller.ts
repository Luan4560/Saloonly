import { FastifyReply, FastifyRequest } from "fastify";

export async function createAppointment(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
  console.log(request.body)

  }catch(error) {
    return reply.code(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}