import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getEstablishments,
  getEstablishmentById,
  updateEstablishment,
  deleteEstablishment,
  type Establishment,
} from "@/lib/api";

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

function buildWorkingDaysForm(workingDay?: Establishment["workingDay"]) {
  if (!workingDay?.length) return defaultWorkingDaysForm;
  return DAYS_OF_WEEK.map((day) => {
    const w = workingDay.find((d) => d.day_of_week === day.value);
    return w
      ? { day_of_week: day.value, open: true, open_time: w.open_time, close_time: w.close_time }
      : { day_of_week: day.value, open: false, open_time: "08:00", close_time: "12:00" };
  });
}

const establishmentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("E-mail inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().optional(),
  image: z.string().min(1, "URL da imagem é obrigatória"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Senha com no mínimo 6 caracteres",
    }),
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

export default function Establishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingEstablishment, setLoadingEstablishment] = useState(false);

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

  async function load() {
    try {
      setLoading(true);
      const data = await getEstablishments();
      setEstablishments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar estabelecimentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values: EstablishmentFormValues) {
    if (!editingId) return;
    const workingDaysPayload = values.workingDays
      .filter((d) => d.open)
      .map((d) => ({
        day_of_week: d.day_of_week,
        open_time: d.open_time,
        close_time: d.close_time,
      }));
    try {
      await updateEstablishment(editingId, {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        image: values.image,
        workingDays: workingDaysPayload,
      });
      toast.success("Estabelecimento atualizado.");
      setSheetOpen(false);
      setEditingId(null);
      form.reset();
      load();
    } catch (e: unknown) {
      const err = e as {
        response?: { status?: number; data?: { message?: string } };
      };
      toast.error(err.response?.data?.message ?? "Erro ao salvar.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este estabelecimento?")) return;
    try {
      await deleteEstablishment(id);
      toast.success("Estabelecimento excluído.");
      load();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  async function openEdit(e: Establishment) {
    setEditingId(e.id);
    setSheetOpen(true);
    setLoadingEstablishment(true);
    try {
      const full = await getEstablishmentById(e.id);
      const establishment = full as Establishment;
      form.reset({
        name: establishment.name,
        phone: establishment.phone,
        email: establishment.email,
        address: establishment.address,
        description: establishment.description ?? "",
        image: establishment.image,
        password: "",
        workingDays: buildWorkingDaysForm(establishment.workingDay),
      });
    } catch {
      toast.error("Erro ao carregar dados do estabelecimento.");
      setSheetOpen(false);
      setEditingId(null);
    } finally {
      setLoadingEstablishment(false);
    }
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Estabelecimentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus estabelecimentos.
            </p>
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="right" className="overflow-y-auto p-6">
              <SheetHeader>
                <SheetTitle>Editar estabelecimento</SheetTitle>
              </SheetHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
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
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://..."
                              {...field}
                              onPaste={(e) => {
                                const text =
                                  e.clipboardData.getData("text/plain");
                                if (text) field.onChange(text);
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard
                                  .readText()
                                  .then(field.onChange)
                                  .catch(() =>
                                    toast.error(
                                      "Não foi possível acessar a área de transferência.",
                                    ),
                                  );
                              }}
                            >
                              Colar
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!editingId && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
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
                  )}
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
                  {loadingEstablishment ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : (
                    <Button type="submit" className="w-full">
                      {editingId ? "Salvar" : "Criar"}
                    </Button>
                  )}
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>

        {loading ? (
          <p className="text-muted-foreground mt-6">Carregando...</p>
        ) : establishments.length === 0 ? (
          <p className="text-muted-foreground mt-6">
            Nenhum estabelecimento cadastrado.
          </p>
        ) : (
          <div className="mt-6 rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Nome</th>
                  <th className="text-left p-3 font-medium">Telefone</th>
                  <th className="text-left p-3 font-medium">E-mail</th>
                  <th className="text-left p-3 font-medium">Endereço</th>
                  <th className="p-3 w-24">Ações</th>
                </tr>
              </thead>
              <tbody>
                {establishments.map((e) => (
                  <tr key={e.id} className="border-b">
                    <td className="p-3">{e.name}</td>
                    <td className="p-3">{e.phone}</td>
                    <td className="p-3">{e.email}</td>
                    <td className="p-3">{e.address}</td>
                    <td className="p-3 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(e.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
