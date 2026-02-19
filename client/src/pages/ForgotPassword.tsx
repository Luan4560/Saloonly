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
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPassword } from "@/lib/api/auth";
import { useState } from "react";
import { toast } from "sonner";
import Logo from "../assets/logo.svg";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await forgotPassword(values.email);
      setSent(true);
      toast.success(
        "Se o e-mail existir na base, você receberá um link para redefinir a senha."
      );
    } catch {
      setSent(true);
      toast.success(
        "Se o e-mail existir na base, você receberá um link para redefinir a senha."
      );
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full flex flex-col items-center max-w-md">
        <img
          src={Logo}
          alt="Saloonly"
          className="w-40 mb-6"
          width={240}
          height={240}
          loading="lazy"
        />
        <h1 className="text-xl font-semibold mb-2">Esqueci minha senha</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Informe seu e-mail e enviaremos um link para redefinir a senha.
        </p>
        {sent ? (
          <div className="space-y-4 w-full">
            <p className="text-sm text-muted-foreground text-center">
              Verifique sua caixa de entrada e o spam. O link expira em 1 hora.
            </p>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                Voltar ao login
              </Button>
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Digite seu e-mail"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Enviar link
              </Button>
              <Link to="/" className="block">
                <Button type="button" variant="ghost" className="w-full">
                  Voltar ao login
                </Button>
              </Link>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
