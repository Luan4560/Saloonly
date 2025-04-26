import { z } from "zod";
import { registerSalon } from "./controllers/register-salon";
import { FastifyTypedInstance } from "@/types";

export async function routes(app: FastifyTypedInstance) {
  app.post(
    "/salon",
    {
      schema: {
        tags: ["salon"],
        description: "Register a new salon",
        body: z.object({
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
        }),
        response: {
          201: z.null()
        }
      },
    },
  
     registerSalon
  );
  
}

