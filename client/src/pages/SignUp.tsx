import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSignUp } from "@/hooks/useSignUp";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import Logo from "../assets/logo.svg";

export default function SignUp() {
  const { form, onSubmit, error } = useSignUp();

  return (
    <div className="w-full h-screen flex flex-col items-center">
      <div className="w-full flex items-center justify-center mb-[-3rem]">
        <img
          src={Logo}
          alt="saloonly-image-logo"
          className="w-[15rem]"
          width={240}
          height={240}
          loading="lazy"
        />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-[90%] space-y-5 md:w-[25%]"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Digite seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Digite seu email"
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
                    placeholder="Digite sua senha"
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
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirme sua senha"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-xs text-muted-foreground text-center">
            Ao cadastrar você concorda com os{" "}
            <Link to="/terms" className="text-primary underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="/privacy" className="text-primary underline">
              Política de Privacidade
            </Link>
            .
          </p>

          <Button type="submit" className="w-full cursor-pointer">
            Criar conta
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Após criar a conta, faça login e cadastre seu estabelecimento.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}
