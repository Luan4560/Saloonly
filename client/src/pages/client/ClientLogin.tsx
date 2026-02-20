import Logo from "@/assets/logo.svg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clientLogin } from "@/lib/api/clientAuth";
import { useClientAuthStore } from "@/stores/clientAuthStore";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const clientLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export default function ClientLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get("registered");
  const login = useClientAuthStore((s) => s.login);
  const accessToken = useClientAuthStore((s) => s.accessToken);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectTo = searchParams.get("redirect");

  useEffect(() => {
    if (accessToken) {
      const target =
        redirectTo && redirectTo.startsWith("/") ? decodeURIComponent(redirectTo) : "/booking";
      navigate(target, { replace: true });
    }
  }, [accessToken, navigate, redirectTo]);

  async function onSubmit(values: ClientLoginFormValues) {
    setError(null);
    try {
      const data = await clientLogin(values);
      login(data.accessToken, data.user);
      const target =
        redirectTo && redirectTo.startsWith("/") ? decodeURIComponent(redirectTo) : "/booking";
      navigate(target, { replace: true });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Não foi possível entrar. Tente novamente.";
      setError(message ?? "Erro ao fazer login.");
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Link
            to="/booking"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            <img
              src={Logo}
              alt="Saloonly"
              className="h-24 w-auto"
              width={240}
              height={240}
              loading="lazy"
            />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">
            Entrar na sua conta
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Use seu email e senha para acessar seus agendamentos.
          </p>
          {registered === "1" && (
            <p className="text-sm text-green-600 dark:text-green-400" role="status">
              Conta criada. Faça login para continuar.
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link
            to="/client/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
