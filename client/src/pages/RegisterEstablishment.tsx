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
import { createEstablishment } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import Logo from "@/assets/logo.svg";

const establishmentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().optional(),
  image: z.string().min(1, "URL da imagem é obrigatória"),
  password: z.string().min(6, "Senha com no mínimo 6 caracteres"),
});

type EstablishmentFormValues = z.infer<typeof establishmentFormSchema>;

const defaultWorkingDays = [
  { day_of_week: "MONDAY", open_time: "08:00", close_time: "18:00" },
];

export default function RegisterEstablishment() {
  const navigate = useNavigate();
  const establishmentId = useAuthStore((state) => state.establishmentId);

  useEffect(() => {
    if (establishmentId) {
      navigate("/dashboard", { replace: true });
    }
  }, [establishmentId, navigate]);

  const form = useForm<EstablishmentFormValues>({
    resolver: zodResolver(establishmentFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      description: "",
      image: "",
      password: "",
    },
  });

  async function onSubmit(values: EstablishmentFormValues) {
    try {
      const data = await createEstablishment({
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        description: values.description || undefined,
        image: values.image,
        password: values.password,
        workingDays: defaultWorkingDays,
      });
      if (data.accessToken && data.user) {
        useAuthStore.getState().login(data.accessToken, data.user);
        toast.success("Estabelecimento cadastrado com sucesso!");
        navigate("/dashboard", { replace: true });
      }
    } catch (e: unknown) {
      const err = e as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (err.response?.status === 403) {
        toast.error(
          "Sua conta já está vinculada a um estabelecimento. Cada conta pode ter apenas um."
        );
      } else {
        toast.error(err.response?.data?.message ?? "Erro ao cadastrar.");
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center">
        <img
          src={Logo}
          alt="Saloonly"
          className="w-24 h-24 mb-6"
          width={96}
          height={96}
        />
        <h1 className="text-2xl font-semibold text-center mb-1">
          Cadastre seu estabelecimento
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          Preencha os dados abaixo para continuar.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do estabelecimento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
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
                  <FormLabel>Senha do estabelecimento</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mín. 6 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Cadastrar e continuar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
