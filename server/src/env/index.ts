import path from "path";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../../../.env") });

import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
    PORT: z.coerce.number().default(8080),
    JWT_SECRET: z.string(),
    DATABASE_URL: z.string(),
    COOKIE_SECRET: z
      .string()
      .optional()
      .transform((v) => {
        if (v && v.length >= 32) return v;
        if (process.env.NODE_ENV === "dev")
          return "dev-cookie-secret-not-for-production-32ch";
        return undefined;
      }),
    FRONTEND_URL: z.string().url().default("http://localhost:5173"),
    SMTP_HOST: z.string().optional().default("smtp.gmail.com"),
    SMTP_PORT: z.coerce.number().optional().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z
      .string()
      .optional()
      .default("false")
      .transform((v) => v === "true"),
    MAIL_FROM: z
      .string()
      .optional()
      .default("Saloonly <noreply@saloonly.com>"),
  })
  .refine(
    (data) =>
      data.NODE_ENV === "production"
        ? data.COOKIE_SECRET != null && data.COOKIE_SECRET.length >= 32
        : true,
    {
      message: "COOKIE_SECRET is required in production (min 32 characters)",
      path: ["COOKIE_SECRET"],
    },
  );

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  const formatted = _env.error.format();
  console.error("Invalid environment variables", formatted);
  const message =
    "Invalid environment variables: " + JSON.stringify(formatted, null, 2);
  throw new Error(message);
}

export const env = _env.data;
