import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  getMyAppointments,
  cancelAppointment,
  type MyAppointment,
  type AppointmentStatus,
} from "@/lib/api/clientAuth";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Realizado",
  CANCELED: "Cancelado",
};

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  CONFIRMED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  COMPLETED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
  CANCELED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};

function formatPrice(value: string): string {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function canCancel(status: AppointmentStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED";
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<MyAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyAppointments()
      .then((data) => {
        if (!cancelled) setAppointments(data);
      })
      .catch(() => {
        if (!cancelled)
          toast.error("Não foi possível carregar seus agendamentos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancel(appointment: MyAppointment) {
    if (!canCancel(appointment.status)) return;
    setCancelingId(appointment.id);
    try {
      const updated = await cancelAppointment(appointment.id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
      toast.success("Agendamento cancelado.");
    } catch {
      toast.error("Não foi possível cancelar o agendamento.");
    } finally {
      setCancelingId(null);
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-32 rounded-lg border border-border bg-card" />
          <div className="h-32 rounded-lg border border-border bg-card" />
          <div className="h-32 rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Meus agendamentos
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Veja e gerencie seus agendamentos.
      </p>

      {appointments.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <Calendar
            className="mx-auto size-12 text-muted-foreground"
            aria-hidden
          />
          <p className="mt-4 font-medium text-foreground">Nenhum agendamento</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando você agendar um horário, ele aparecerá aqui.
          </p>
          <Button asChild className="mt-6">
            <Link to="/booking">Buscar negócios</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {appointments.map((apt) => (
            <li
              key={apt.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/booking/${apt.establishment.id}`}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {apt.establishment.name}
                    </Link>
                    <span
                      className={
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium " +
                        STATUS_STYLES[apt.status]
                      }
                    >
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4 shrink-0" aria-hidden />
                      {formatDateTime(apt.appointment_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="size-4 shrink-0" aria-hidden />
                      {apt.collaborator.name}
                    </span>
                    {apt.establishment.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4 shrink-0" aria-hidden />
                        <span className="truncate max-w-[200px]">
                          {apt.establishment.address}
                        </span>
                      </span>
                    )}
                  </div>
                  {apt.services.length > 0 && (
                    <div className="pt-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Serviços
                      </p>
                      <ul className="mt-0.5 flex flex-wrap gap-1.5 text-sm">
                        {apt.services.map((s) => (
                          <li key={s.id} className="text-foreground">
                            {s.description ?? "Serviço"} •{" "}
                            {formatPrice(s.price)} • {s.duration} min
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {canCancel(apt.status) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleCancel(apt)}
                    disabled={cancelingId === apt.id}
                  >
                    <XCircle className="size-4 sm:mr-1.5" aria-hidden />
                    <span className="hidden sm:inline">
                      {cancelingId === apt.id ? "Cancelando..." : "Cancelar"}
                    </span>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
