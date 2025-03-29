import { FastifyInstance } from "fastify";
import { registerSalon } from "./controllers/register-salon";

export async function appRoutes(app: FastifyInstance){
    app.post("/salon", registerSalon)
}