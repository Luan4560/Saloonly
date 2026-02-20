import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getEstablishmentDetails,
  getAvailableSlots,
  type PublicEstablishmentDetail,
  type PublicEstablishmentService,
  type PublicEstablishmentCollaborator,
  type AvailableSlot,
} from "@/lib/api/public";
import { createBooking } from "@/lib/api/clientAuth";
import { useClientAuthStore } from "@/stores/clientAuthStore";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Check,
  User,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_NAMES: Record<number, string> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

function getDayOfWeek(date: Date): string {
  return DAY_NAMES[date.getDay()] ?? "MONDAY";
}

function formatPrice(value: string): string {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

const STEPS = [
  { id: 1, title: "Serviços", icon: Scissors },
  { id: 2, title: "Colaborador", icon: User },
  { id: 3, title: "Data e horário", icon: CalendarIcon },
  { id: 4, title: "Seus dados", icon: User },
  { id: 5, title: "Confirmação", icon: Check },
];

export default function BookingFlow() {
  const { id: establishmentId } = useParams<{ id: string }>();
  const { user } = useClientAuthStore();
  const [establishment, setEstablishment] =
    useState<PublicEstablishmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Step 1: services
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set()
  );
  // Step 2: collaborator (null = no preference, use first)
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<
    string | null
  >(null);
  // Step 3: date & slot
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  // Step 4: guest info
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  // Step 5: submit
  const [submitting, setSubmitting] = useState(false);
  const [bookingDone, setBookingDone] = useState(false);

  const totalDuration = useMemo(() => {
    if (!establishment) return 0;
    return establishment.services
      .filter((s) => selectedServiceIds.has(s.id))
      .reduce((acc, s) => acc + s.duration, 0);
  }, [establishment, selectedServiceIds]);

  const totalPrice = useMemo(() => {
    if (!establishment) return "0";
    const total = establishment.services
      .filter((s) => selectedServiceIds.has(s.id))
      .reduce((acc, s) => acc + parseFloat(s.price), 0);
    return String(total);
  }, [establishment, selectedServiceIds]);

  const effectiveCollaboratorId = useMemo(() => {
    if (selectedCollaboratorId) return selectedCollaboratorId;
    if (establishment?.collaborators.length) {
      return establishment.collaborators[0]!.id;
    }
    return "";
  }, [establishment, selectedCollaboratorId]);

  useEffect(() => {
    if (!establishmentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEstablishmentDetails(establishmentId)
      .then((data) => {
        if (!cancelled) setEstablishment(data);
      })
      .catch(() => {
        if (!cancelled) setError("Negócio não encontrado.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [establishmentId]);

  useEffect(() => {
    if (!establishmentId || !selectedDate) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot(null);
    getAvailableSlots(establishmentId, {
      date: selectedDate,
      collaborator_id: effectiveCollaboratorId || undefined,
      slot_duration_minutes: totalDuration || 30,
    })
      .then((res) => {
        if (!cancelled) setSlots(res.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [establishmentId, selectedDate, effectiveCollaboratorId, totalDuration]);

  const toggleService = useCallback((serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  }, []);

  const canProceedFromStep1 = selectedServiceIds.size > 0;
  const canProceedFromStep2 = true;
  const canProceedFromStep3 =
    selectedDate != null && selectedSlot != null && slots.length > 0;
  const canProceedFromStep4 = user
    ? true
    : Boolean(
        guestName.trim() && guestEmail.trim() && guestPhone.trim()
      );

  const canConfirm =
    Boolean(effectiveCollaboratorId) &&
    selectedServiceIds.size > 0 &&
    selectedDate != null &&
    selectedSlot != null &&
    (user || (guestName.trim() && guestEmail.trim() && guestPhone.trim()));

  const handleConfirmBooking = useCallback(async () => {
    if (!establishmentId || !canConfirm) {
      return;
    }
    if (!effectiveCollaboratorId) return;
    if (!user && (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim())) {
      return;
    }
    setSubmitting(true);
    const dateStr = selectedDate.toISOString().slice(0, 10);
    try {
      await createBooking({
        establishment_id: establishmentId,
        collaborator_id: effectiveCollaboratorId,
        service_ids: Array.from(selectedServiceIds),
        workingDays: [
          {
            day_of_week: getDayOfWeek(selectedDate),
            open_time: selectedSlot.open_time,
            close_time: selectedSlot.close_time,
            appointment_date: dateStr,
          },
        ],
        ...(user
          ? {}
          : {
              guest_name: guestName.trim(),
              guest_email: guestEmail.trim(),
              guest_phone: guestPhone.trim(),
            }),
      });
      setBookingDone(true);
    } catch {
      // Error already shown by axios interceptor
    } finally {
      setSubmitting(false);
    }
  }, [
    establishmentId,
    effectiveCollaboratorId,
    canConfirm,
    selectedDate,
    selectedSlot,
    selectedServiceIds,
    user,
    guestName,
    guestEmail,
    guestPhone,
  ]);

  if (!establishmentId) {
    return (
      <div className="container max-w-2xl px-4 py-8">
        <p className="text-muted-foreground">Identificador inválido.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/booking">Voltar à busca</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-2/3 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="container max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">
          {error ?? "Negócio não encontrado."}
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/booking">Voltar à busca</Link>
        </Button>
      </div>
    );
  }

  if (bookingDone) {
    return (
      <div className="container max-w-2xl px-4 py-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-8" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-foreground">
          Agendamento realizado!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Você receberá um e-mail de confirmação em breve.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to={`/booking/${establishmentId}`}>
              Voltar ao negócio
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/booking">Buscar outros negócios</Link>
          </Button>
        </div>
      </div>
    );
  }

  const services = establishment.services;
  const collaborators = establishment.collaborators;

  return (
    <div className="container max-w-2xl px-4 py-6 sm:py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link to={`/booking/${establishmentId}`}>
          <ArrowLeft className="size-4 mr-1" aria-hidden />
          Voltar
        </Link>
      </Button>

      <h1 className="text-2xl font-semibold text-foreground">
        Agendar em {establishment.name}
      </h1>

      {/* Stepper */}
      <nav
        className="mt-6 flex flex-wrap gap-2 sm:gap-4"
        aria-label="Etapas do agendamento"
      >
        {STEPS.map((s) => {
          const isActive = step === s.id;
          const isPast = step > s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive &&
                  "bg-primary text-primary-foreground",
                isPast && !isActive && "bg-muted text-muted-foreground",
                !isActive && !isPast && "text-muted-foreground hover:bg-muted/50"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {s.title}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Step 1: Services */}
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold text-foreground">
              Selecione os serviços
            </h2>
            {services.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum serviço disponível.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {services.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    selected={selectedServiceIds.has(svc.id)}
                    onToggle={() => toggleService(svc.id)}
                  />
                ))}
              </ul>
            )}
          </>
        )}

        {/* Step 2: Collaborator */}
        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold text-foreground">
              Escolha o colaborador (opcional)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sem preferência = qualquer colaborador disponível
            </p>
            {collaborators.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhum colaborador cadastrado; o negócio atribuirá um
                horário.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCollaboratorId(null)}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-colors",
                      selectedCollaboratorId === null
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <span className="font-medium">Sem preferência</span>
                  </button>
                </li>
                {collaborators.map((col) => (
                  <CollaboratorCard
                    key={col.id}
                    collaborator={col}
                    selected={selectedCollaboratorId === col.id}
                    onSelect={() => setSelectedCollaboratorId(col.id)}
                  />
                ))}
              </ul>
            )}
          </>
        )}

        {/* Step 3: Date & time */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold text-foreground">
              Data e horário
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Duração total: {formatDuration(totalDuration)}
            </p>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row">
              <div>
                <Label className="text-muted-foreground">Data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border border-border mt-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Label className="text-muted-foreground">Horário</Label>
                {!selectedDate ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selecione uma data primeiro.
                  </p>
                ) : slotsLoading ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Carregando horários...
                  </p>
                ) : slots.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Nenhum horário disponível nesta data.
                  </p>
                ) : (
                  <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((slot) => (
                      <li key={`${slot.open_time}-${slot.close_time}`}>
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            "w-full rounded-md border py-2 text-sm font-medium transition-colors",
                            selectedSlot?.open_time === slot.open_time &&
                              selectedSlot?.close_time === slot.close_time
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          {slot.open_time}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {/* Step 4: Customer info */}
        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold text-foreground">
              Seus dados
            </h2>
            {user ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Agendamento será feito como{" "}
                <strong className="text-foreground">{user.email}</strong>
                {user.name ? ` (${user.name})` : ""}.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Preencha para receber a confirmação por e-mail.
              </p>
            )}
            {!user && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="guest-name">Nome</Label>
                  <Input
                    id="guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-email">E-mail</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-phone">Telefone</Label>
                  <Input
                    id="guest-phone"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <Link
                    to="/client/login"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            )}
          </>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <>
            <h2 className="text-lg font-semibold text-foreground">
              Resumo do agendamento
            </h2>
            <BookingSummary
              establishment={establishment}
              selectedServiceIds={selectedServiceIds}
              selectedCollaboratorId={selectedCollaboratorId}
              collaborators={collaborators}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              totalPrice={totalPrice}
              totalDuration={totalDuration}
              guestName={user?.name ?? guestName}
              guestEmail={user?.email ?? guestEmail}
              guestPhone={guestPhone}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={handleConfirmBooking}
                disabled={submitting || !canConfirm}
              >
                {submitting ? "Confirmando..." : "Confirmar agendamento"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep(4)}
              >
                Alterar dados
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="size-4 mr-1" aria-hidden />
          Anterior
        </Button>
        {step < 5 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={
              (step === 1 && !canProceedFromStep1) ||
              (step === 2 && !canProceedFromStep2) ||
              (step === 3 && !canProceedFromStep3) ||
              (step === 4 && !canProceedFromStep4)
            }
          >
            Próximo
            <ArrowRight className="size-4 ml-1" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  selected,
  onToggle,
}: {
  service: PublicEstablishmentService;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full rounded-lg border p-4 text-left transition-colors",
          selected
            ? "border-primary bg-primary/5 text-foreground"
            : "border-border hover:bg-muted/50"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground line-clamp-2">
              {service.description || "Serviço"}
            </p>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatPrice(service.price)}</span>
              <span>•</span>
              <span>{formatDuration(service.duration)}</span>
            </div>
          </div>
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30"
            )}
          >
            {selected ? (
              <Check className="size-3.5" aria-hidden />
            ) : null}
          </div>
        </div>
      </button>
    </li>
  );
}

function CollaboratorCard({
  collaborator,
  selected,
  onSelect,
}: {
  collaborator: PublicEstablishmentCollaborator;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "w-full rounded-lg border p-4 text-left transition-colors",
          selected
            ? "border-primary bg-primary/5 text-foreground"
            : "border-border hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {collaborator.avatar ? (
              <img
                src={collaborator.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="size-6 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">
              {collaborator.name}
            </p>
            {collaborator.role ? (
              <p className="text-sm text-muted-foreground truncate">
                {collaborator.role}
              </p>
            ) : null}
          </div>
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30"
            )}
          >
            {selected ? (
              <Check className="size-3.5" aria-hidden />
            ) : null}
          </div>
        </div>
      </button>
    </li>
  );
}

function BookingSummary({
  establishment,
  selectedServiceIds,
  selectedCollaboratorId,
  collaborators,
  selectedDate,
  selectedSlot,
  totalPrice,
  totalDuration,
  guestName,
  guestEmail,
  guestPhone,
}: {
  establishment: PublicEstablishmentDetail;
  selectedServiceIds: Set<string>;
  selectedCollaboratorId: string | null;
  collaborators: PublicEstablishmentCollaborator[];
  selectedDate: Date | undefined;
  selectedSlot: AvailableSlot | null;
  totalPrice: string;
  totalDuration: number;
  guestName: string | null;
  guestEmail: string;
  guestPhone: string;
}) {
  const selectedServices = establishment.services.filter((s) =>
    selectedServiceIds.has(s.id)
  );
  const collaborator = selectedCollaboratorId
    ? collaborators.find((c) => c.id === selectedCollaboratorId)
    : null;

  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Serviços</p>
        <ul className="mt-1 text-sm text-foreground">
          {selectedServices.map((s) => (
            <li key={s.id}>
              {s.description || "Serviço"} — {formatPrice(s.price)} (
              {formatDuration(s.duration)})
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Colaborador
        </p>
        <p className="mt-1 text-sm text-foreground">
          {collaborator ? collaborator.name : "Sem preferência"}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Data e horário
        </p>
        <p className="mt-1 text-sm text-foreground">
          {selectedDate
            ? selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "—"}{" "}
          {selectedSlot
            ? `${selectedSlot.open_time} – ${selectedSlot.close_time}`
            : ""}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Total: {formatPrice(totalPrice)} • {formatDuration(totalDuration)}
        </p>
      </div>
      {(guestName || guestEmail || guestPhone) && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Contato</p>
          <p className="mt-1 text-sm text-foreground">
            {guestName && <span>{guestName}</span>}
            {guestEmail && (
              <span className="block truncate">{guestEmail}</span>
            )}
            {guestPhone && <span className="block">{guestPhone}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
