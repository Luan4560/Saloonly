import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  getEstablishmentDetails,
  type PublicEstablishmentDetail,
  type EstablishmentType,
} from "@/lib/api/public";
import {
  Clock,
  MapPin,
  Mail,
  Phone,
  Scissors,
  Sparkles,
  User,
  Calendar,
} from "lucide-react";

const ESTABLISHMENT_TYPE_OPTIONS: {
  value: EstablishmentType;
  label: string;
}[] = [
  { value: "BARBERSHOP", label: "Barbearia" },
  { value: "BEAUTY_SALON", label: "Salão de beleza" },
];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

function getTypeLabel(type: EstablishmentType): string {
  return ESTABLISHMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function TypeBadge({ type }: { type: EstablishmentType }) {
  const isBarber = type === "BARBERSHOP";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium " +
        (isBarber
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
          : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200")
      }
    >
      {isBarber ? (
        <Scissors className="size-3.5" aria-hidden />
      ) : (
        <Sparkles className="size-3.5" aria-hidden />
      )}
      {getTypeLabel(type)}
    </span>
  );
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

export default function EstablishmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [establishment, setEstablishment] =
    useState<PublicEstablishmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEstablishmentDetails(id)
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
  }, [id]);

  if (!id) {
    return (
      <div className="container max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">Identificador inválido.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="aspect-video w-full rounded-lg bg-muted" />
          <div className="h-8 w-2/3 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="container max-w-4xl px-4 py-12 text-center">
        <p className="text-muted-foreground">
          {error ?? "Negócio não encontrado."}
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/booking">Voltar à busca</Link>
        </Button>
      </div>
    );
  }

  const { workingDays } = establishment;
  const sortedDays = [...workingDays].sort(
    (a, b) =>
      Object.keys(DAY_LABELS).indexOf(a.day_of_week) -
      Object.keys(DAY_LABELS).indexOf(b.day_of_week)
  );

  return (
    <div className="container max-w-4xl px-4 py-6 sm:py-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="aspect-video w-full bg-muted">
          {establishment.image ? (
            <img
              src={establishment.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Scissors className="size-16 sm:size-20" aria-hidden />
            </div>
          )}
        </div>
        <div className="border-t border-border p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {establishment.name}
              </h1>
              <div className="mt-2">
                <TypeBadge type={establishment.establishment_type} />
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link to={`/booking/${establishment.id}/book`}>
                <Calendar className="size-4 shrink-0 sm:mr-2" aria-hidden />
                <span>Agendar</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Info & contact */}
      <section className="mt-8" aria-label="Informações e contato">
        <h2 className="text-lg font-semibold text-foreground">
          Informações
        </h2>
        <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/20 p-4 sm:p-5">
          {establishment.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {establishment.description}
            </p>
          ) : null}
          {establishment.address ? (
            <p className="flex items-start gap-2 text-sm text-foreground">
              <MapPin className="size-4 shrink-0 mt-0.5" aria-hidden />
              <span>{establishment.address}</span>
            </p>
          ) : null}
          {establishment.phone ? (
            <p className="flex items-center gap-2 text-sm">
              <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <a
                href={`tel:${establishment.phone}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {establishment.phone}
              </a>
            </p>
          ) : null}
          {establishment.email ? (
            <p className="flex items-center gap-2 text-sm">
              <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <a
                href={`mailto:${establishment.email}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {establishment.email}
              </a>
            </p>
          ) : null}
        </div>
      </section>

      {/* Working hours */}
      {sortedDays.length > 0 && (
        <section className="mt-8" aria-label="Horário de funcionamento">
          <h2 className="text-lg font-semibold text-foreground">
            Horário de funcionamento
          </h2>
          <ul className="mt-3 space-y-2 rounded-lg border border-border bg-muted/20 p-4 sm:p-5">
            {sortedDays.map((wd) => (
              <li
                key={wd.day_of_week}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <Clock className="size-4 text-muted-foreground" aria-hidden />
                  {DAY_LABELS[wd.day_of_week] ?? wd.day_of_week}
                </span>
                <span className="text-muted-foreground">
                  {wd.open_time} – {wd.close_time}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Services */}
      <section className="mt-8" aria-label="Serviços">
        <h2 className="text-lg font-semibold text-foreground">Serviços</h2>
        {establishment.services.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum serviço cadastrado no momento.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {establishment.services.map((svc) => (
              <li
                key={svc.id}
                className="flex flex-col rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {svc.description || "Serviço"}
                </p>
                <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatPrice(svc.price)}</span>
                  <span>•</span>
                  <span>{formatDuration(svc.duration)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Collaborators */}
      <section className="mt-8" aria-label="Colaboradores">
        <h2 className="text-lg font-semibold text-foreground">Colaboradores</h2>
        {establishment.collaborators.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum colaborador cadastrado.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {establishment.collaborators.map((col) => (
              <li
                key={col.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {col.avatar ? (
                    <img
                      src={col.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="size-6 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {col.name}
                  </p>
                  {col.role ? (
                    <p className="text-sm text-muted-foreground truncate">
                      {col.role}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-border bg-primary/5 p-6 sm:flex-row sm:justify-center">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          Pronto para agendar? Escolha o horário e os serviços.
        </p>
        <Button asChild size="lg">
          <Link to={`/booking/${establishment.id}/book`}>
            <Calendar className="size-4 shrink-0 mr-2" aria-hidden />
            Agendar horário
          </Link>
        </Button>
      </div>
    </div>
  );
}
