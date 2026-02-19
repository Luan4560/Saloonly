import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPassword } from "@/lib/api/auth";
import { useState } from "react";
import { toast } from "sonner";
import Logo from "../assets/logo.svg";

const schema = z
  .object({
    newPassword: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Link inválido. Solicite uma nova redefinição.");
      return;
    }
    try {
      await resetPassword(token, values.newPassword);
      setSuccess(true);
      toast.success("Senha alterada. Faça login com a nova senha.");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message ?? "Link inválido ou expirado. Solicite uma nova redefinição."
      );
    }
  }

  if (!token) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Link inválido. Use o link enviado por e-mail ou solicite uma nova
            redefinição de senha.
          </p>
          <Link to="/forgot-password">
            <Button>Solicitar redefinição</Button>
          </Link>
          <Link to="/" className="block mt-2">
            <Button variant="ghost">Voltar ao login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
        <img
          src={Logo}
          alt="Saloonly"
          className="w-40 mb-6"
          width={240}
          height={240}
          loading="lazy"
        />
        <p className="text-center text-muted-foreground mb-4">
          Senha alterada com sucesso. Faça login com a nova senha.
        </p>
        <Link to="/">
          <Button>Ir para o login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <img
          src={Logo}
          alt="Saloonly"
          className="w-40 mx-auto"
          width={240}
          height={240}
          loading="lazy"
        />
        <h1 className="text-xl font-semibold text-center">
          Redefinir senha
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nova senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repita a senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Redefinir senha
            </Button>
            <Link to="/" className="block">
              <Button type="button" variant="ghost" className="w-full">
                Voltar ao login
              </Button>
            </Link>
          </form>
        </Form>
      </div>
    </div>
  );
}
