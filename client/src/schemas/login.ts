import { z } from "zod";

export const formLoginSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),
  password: z.string().min(6, {
    message: "Senha precisa ter no minímo 6 caracteres",
  }),
});

export const formSignUp = z
  .object({
    name: z.string().min(3, {
      message: "Nome precisa ter pelo menos 3 caracteres",
    }),
    email: z.string().email({
      message: "Email inválido",
    }),
    password: z.string().min(6, {
      message: "Senha precisa ter no minímo 6 caracteres",
    }),
    confirmPassword: z.string(),

    role: z.enum(["ADMIN", "USER"]),
  })

  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Confirmação de senha incorreta. As senhas devem ser iguais. ",
        path: ["confirmPassword"],
      });
    }
  });
