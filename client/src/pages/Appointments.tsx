import { DatePicker } from "@/components/DatePicker";
import { Layout } from "@/components/layout";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getAppointments,
  updateAppointmentStatus,
  createAppointment,
  getEstablishments,
  getCollaborators,
  getServices,
  type Appointment,
  type Service,
} from "@/lib/api";
import { formatDateOnlyUTC } from "@/lib/utils";
import { Check, X, CircleCheck, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};

const DAYS: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const newH = Math.floor(wrapped / 60);
  const newM = wrapped % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

const createFormSchema = z
  .object({
    establishment_id: z.string().min(1, "Selecione o estabelecimento"),
    collaborator_id: z.string().min(1, "Selecione o colaborador"),
    service_ids: z
      .array(z.string())
      .min(1, "Selecione pelo menos um serviço"),
    appointment_date: z.string().min(1, "Data é obrigatória"),
    open_time: z.string().min(1, "Horário de início é obrigatório"),
    close_time: z.string().min(1, "Horário de fim é obrigatório"),
  })
  .refine(
    (data) => {
      const [y, m, d] = data.appointment_date.split("-").map(Number);
      const appDate = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appDate.setHours(0, 0, 0, 0);
      return appDate >= today;
    },
    {
      message: "Não é possível agendar em data passada.",
      path: ["appointment_date"],
    },
  );

type CreateFormValues = z.infer<typeof createFormSchema>;

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [establishments, setEstablishments] = useState<
    { id: string; name: string }[]
  >([]);
  const [collaborators, setCollaborators] = useState<
    { id: string; name: string }[]
  >([]);
  const [services, setServices] = useState<Service[]>([]);

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      establishment_id: "",
      collaborator_id: "",
      service_ids: [],
      appointment_date: "",
      open_time: "08:00",
      close_time: "18:00",
    },
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params: { status?: string; date_from?: string; date_to?: string } =
        {};
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const data = await getAppointments(params);
      setAppointments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!sheetOpen) return;
    Promise.all([getEstablishments(), getCollaborators(), getServices()])
      .then(([est, coll, srv]) => {
        setEstablishments(Array.isArray(est) ? est : []);
        setCollaborators(Array.isArray(coll) ? coll : []);
        setServices(Array.isArray(srv) ? srv : []);
      })
      .catch(() => toast.error("Erro ao carregar dados"));
  }, [sheetOpen]);

  const serviceIds = form.watch("service_ids") ?? [];
  const openTime = form.watch("open_time");
  const totalDuration = services
    .filter((s) => serviceIds.includes(s.id))
    .reduce((acc, s) => acc + (s.duration ?? 0), 0);
  useEffect(() => {
    if (!openTime || totalDuration <= 0) return;
    form.setValue("close_time", addMinutesToTime(openTime, totalDuration));
  }, [openTime, totalDuration]);

  async function onCreateSubmit(values: CreateFormValues) {
    const d = new Date(values.appointment_date + "T12:00:00");
    const day_of_week = DAYS[d.getDay()];
    try {
      await createAppointment({
        establishment_id: values.establishment_id,
        collaborator_id: values.collaborator_id,
        service_ids: values.service_ids,
        workingDays: [
          {
            day_of_week,
            open_time: values.open_time,
            close_time: values.close_time,
            appointment_date: values.appointment_date,
          },
        ],
      });
      toast.success("Agendamento criado.");
      setSheetOpen(false);
      form.reset();
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Erro ao criar agendamento.");
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateAppointmentStatus(id, newStatus);
      toast.success(
        `Status atualizado para ${statusLabels[newStatus] ?? newStatus}`,
      );
      load();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Agendamentos</h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie os agendamentos.
            </p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo agendamento
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto p-6">
              <SheetHeader>
                <SheetTitle>Novo agendamento</SheetTitle>
              </SheetHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onCreateSubmit)}
                  className="space-y-4 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="establishment_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estabelecimento</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            {...field}
                          >
                            <option value="">Selecione</option>
                            {establishments.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="collaborator_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colaborador</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            {...field}
                          >
                            <option value="">Selecione</option>
                            {collaborators.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="service_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviços</FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2 rounded-md border border-input p-3 max-h-48 overflow-y-auto">
                            {services.map((s) => (
                              <label
                                key={s.id}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={(field.value ?? []).includes(s.id)}
                                  onChange={(e) => {
                                    const prev = field.value ?? [];
                                    if (e.target.checked) {
                                      field.onChange([...prev, s.id]);
                                    } else {
                                      field.onChange(prev.filter((id) => id !== s.id));
                                    }
                                  }}
                                  className="rounded border-input"
                                />
                                <span>
                                  {s.description ?? s.id} ({s.duration} min)
                                </span>
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        {totalDuration > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Duração total: {totalDuration} min
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="appointment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione a data"
                            disablePast
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="open_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário início</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="close_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário fim</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Criar agendamento
                  </Button>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 rounded-md border p-4 bg-muted/30">
          <div>
            <label className="text-sm font-medium mr-2">Status</label>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
          <div>
            <DatePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Data de"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm h-9"
            />
          </div>
          <div>
            <DatePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="Data até"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm h-9"
            />
          </div>
          <Button variant="secondary" onClick={load}>
            Filtrar
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground mt-6">Carregando...</p>
        ) : appointments.length === 0 ? (
          <p className="text-muted-foreground mt-6">
            Nenhum agendamento encontrado.
          </p>
        ) : (
          <div className="mt-6 rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Data</th>
                  <th className="text-left p-3 font-medium">Horário</th>
                  <th className="text-left p-3 font-medium">Estabelecimento</th>
                  <th className="text-left p-3 font-medium">Serviço</th>
                  <th className="text-left p-3 font-medium">Colaborador</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3">
                      {formatDateOnlyUTC(a.appointment_date)}
                    </td>
                    <td className="p-3">
                      {a.open_time} - {a.close_time}
                    </td>
                    <td className="p-3">{a.establishment?.name ?? "-"}</td>
                    <td className="p-3">
                      {a.services?.length
                        ? a.services
                            .map((s) => s.description ?? s.id)
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="p-3">{a.collaborator?.name ?? "-"}</td>
                    <td className="p-3">
                      <span
                        className={
                          a.status === "CONFIRMED"
                            ? "text-green-600"
                            : a.status === "CANCELED"
                              ? "text-destructive"
                              : a.status === "COMPLETED"
                                ? "text-muted-foreground"
                                : ""
                        }
                      >
                        {statusLabels[a.status] ?? a.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {a.status === "PENDING" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Confirmar"
                            onClick={() =>
                              handleStatusChange(a.id, "CONFIRMED")
                            }
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Cancelar"
                            onClick={() => handleStatusChange(a.id, "CANCELED")}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                      {a.status === "CONFIRMED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Concluir"
                          onClick={() => handleStatusChange(a.id, "COMPLETED")}
                        >
                          <CircleCheck className="h-4 w-4" />
                        </Button>
                      )}
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
