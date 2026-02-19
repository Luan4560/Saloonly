import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuthenticate } from "@/hooks/useAuthenticate";

import Logo from "../assets/logo.svg";
import { useEffect } from "react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { form, isLoading, accessToken, establishmentId, onSubmit } = useAuthenticate();

  useEffect(() => {
    if (accessToken) {
      navigate(establishmentId ? "/dashboard" : "/register-establishment", {
        replace: true,
      });
    }
  }, [accessToken, establishmentId, navigate]);

  return (
    <div className="w-[full] h-screen flex flex-col items-center justify-center md:w-[100%] ">
      <div className=" w-full md:w-[50%] flex flex-col items-center mt-[-5rem]">
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
            className="w-[90%] space-y-5 md:w-[50%]"
          >
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

            <Button
              disabled={isLoading}
              type="submit"
              className="w-full cursor-pointer"
            >
              Login
            </Button>

            <div className="w-full text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <div className="w-full flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <p>Ainda não tem uma conta?</p>
                <Link to="/signup" className="text-blue-500 hover:text-blue-400">
                  Cadastre-se aqui
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                Após o primeiro login, você cadastrará seu estabelecimento.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
