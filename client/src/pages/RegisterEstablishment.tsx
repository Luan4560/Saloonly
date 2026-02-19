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

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Segunda-feira" },
  { value: "TUESDAY", label: "Terça-feira" },
  { value: "WEDNESDAY", label: "Quarta-feira" },
  { value: "THURSDAY", label: "Quinta-feira" },
  { value: "FRIDAY", label: "Sexta-feira" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
] as const;

const defaultWorkingDaysForm: {
  day_of_week: string;
  open: boolean;
  open_time: string;
  close_time: string;
}[] = [
  { day_of_week: "MONDAY", open: true, open_time: "08:00", close_time: "18:00" },
  { day_of_week: "TUESDAY", open: true, open_time: "08:00", close_time: "18:00" },
  { day_of_week: "WEDNESDAY", open: true, open_time: "08:00", close_time: "18:00" },
  { day_of_week: "THURSDAY", open: true, open_time: "08:00", close_time: "18:00" },
  { day_of_week: "FRIDAY", open: true, open_time: "08:00", close_time: "18:00" },
  { day_of_week: "SATURDAY", open: true, open_time: "08:00", close_time: "12:00" },
  { day_of_week: "SUNDAY", open: false, open_time: "08:00", close_time: "12:00" },
];

const establishmentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().optional(),
  image: z.string().min(1, "URL da imagem é obrigatória"),
  password: z.string().min(6, "Senha com no mínimo 6 caracteres"),
  workingDays: z
    .array(
      z.object({
        day_of_week: z.string(),
        open: z.boolean(),
        open_time: z.string().min(1, "Horário de abertura"),
        close_time: z.string().min(1, "Horário de fechamento"),
      })
    )
    .length(7)
    .refine((arr) => arr.some((d) => d.open), "Selecione ao menos um dia de atendimento"),
});

type EstablishmentFormValues = z.infer<typeof establishmentFormSchema>;

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
      workingDays: defaultWorkingDaysForm,
    },
  });

  async function onSubmit(values: EstablishmentFormValues) {
    const workingDaysPayload = values.workingDays
      .filter((d) => d.open)
      .map((d) => ({
        day_of_week: d.day_of_week,
        open_time: d.open_time,
        close_time: d.close_time,
      }));
    try {
      const data = await createEstablishment({
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        description: values.description || undefined,
        image: values.image,
        password: values.password,
        workingDays: workingDaysPayload,
      });
      if (data.accessToken && data.user) {
        useAuthStore.getState().login(data.accessToken, data.user);
        if (data.id) useAuthStore.getState().setEstablishmentId(data.id);
        toast.success("Estabelecimento cadastrado com sucesso!");
        navigate("/dashboard", { replace: true });
      } else if (data.id) {
        useAuthStore.getState().setEstablishmentId(data.id);
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
            <div className="space-y-3">
              <p className="text-sm font-medium">Horário de atendimento</p>
              <p className="text-xs text-muted-foreground">
                Marque os dias em que o estabelecimento abre e defina os horários.
              </p>
              <div className="rounded-md border p-3 space-y-3">
                {DAYS_OF_WEEK.map((day, i) => (
                  <div
                    key={day.value}
                    className="flex flex-wrap items-center gap-2 gap-y-2"
                  >
                    <div className="w-28 text-sm">{day.label}</div>
                    <FormField
                      control={form.control}
                      name={`workingDays.${i}.open`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              className="h-4 w-4 rounded border-input"
                            />
                          </FormControl>
                          <FormLabel className="mt-0! text-sm font-normal">
                            Aberto
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`workingDays.${i}.open_time`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              disabled={!form.watch(`workingDays.${i}.open`)}
                              className="w-28"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-muted-foreground text-sm">até</span>
                    <FormField
                      control={form.control}
                      name={`workingDays.${i}.close_time`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              disabled={!form.watch(`workingDays.${i}.open`)}
                              className="w-28"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              {form.formState.errors.workingDays?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.workingDays.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Cadastrar e continuar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
