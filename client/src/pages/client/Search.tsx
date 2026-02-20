import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Scissors, Sparkles } from "lucide-react";

import {
  searchEstablishments,
  type PublicEstablishment,
  type EstablishmentType,
} from "@/lib/api/public";

const ESTABLISHMENT_TYPE_OPTIONS: {
  value: "" | EstablishmentType;
  label: string;
}[] = [
  { value: "", label: "Todos os tipos" },
  { value: "BARBERSHOP", label: "Barbearia" },
  { value: "BEAUTY_SALON", label: "Salão de beleza" },
];

function getTypeLabel(type: EstablishmentType): string {
  return (
    ESTABLISHMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
  );
}

function TypeBadge({ type }: { type: EstablishmentType }) {
  const isBarber = type === "BARBERSHOP";
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
        (isBarber
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
          : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200")
      }
    >
      {isBarber ? (
        <Scissors className="size-3" aria-hidden />
      ) : (
        <Sparkles className="size-3" aria-hidden />
      )}
      {getTypeLabel(type)}
    </span>
  );
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const nameFromUrl = searchParams.get("q") ?? "";
  const typeFromUrl = searchParams.get("type") ?? "";

  const [name, setName] = useState(nameFromUrl);
  const [type, setType] = useState<"" | EstablishmentType>(
    typeFromUrl === "BARBERSHOP" || typeFromUrl === "BEAUTY_SALON"
      ? typeFromUrl
      : "",
  );
  const [establishments, setEstablishments] = useState<PublicEstablishment[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setName(nameFromUrl);
    setType(
      typeFromUrl === "BARBERSHOP" || typeFromUrl === "BEAUTY_SALON"
        ? typeFromUrl
        : "",
    );
  }, [nameFromUrl, typeFromUrl]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string> = {};
    if (name.trim()) params.q = name.trim();
    if (type) params.type = type;
    searchEstablishments({
      name: name.trim() || undefined,
      type: type || undefined,
      page: 1,
      limit: 24,
    })
      .then((data) => {
        if (!cancelled) {
          setEstablishments(data);
          setSearched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEstablishments([]);
          setSearched(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [name, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (name.trim()) next.set("q", name.trim());
    if (type) next.set("type", type);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="container max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Buscar negócios
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Encontre barbearias e salões de beleza para agendar.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3"
      >
        <div className="flex-1 min-w-[200px] space-y-2">
          <Label htmlFor="search-name" className="text-sm font-medium">
            Nome
          </Label>
          <Input
            id="search-name"
            type="search"
            placeholder="Ex.: Barbearia do João"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            aria-label="Buscar por nome"
          />
        </div>
        <div className="w-full sm:w-[180px] space-y-2">
          <Label htmlFor="search-type" className="text-sm font-medium">
            Tipo
          </Label>
          <select
            id="search-type"
            value={type}
            onChange={(e) => setType(e.target.value as "" | EstablishmentType)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Filtrar por tipo"
          >
            {ESTABLISHMENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="shrink-0">
          Buscar
        </Button>
      </form>

      {loading ? (
        <div className="mt-8 flex justify-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <section className="mt-8" aria-label="Resultados da busca">
          {establishments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center">
              <p className="text-muted-foreground">
                {searched
                  ? "Nenhum negócio encontrado. Tente outros filtros."
                  : "Use os filtros acima para buscar negócios."}
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {establishments.map((est) => (
                <li key={est.id}>
                  <Link
                    to={`/booking/${est.id}`}
                    className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                      {est.image ? (
                        <img
                          src={est.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Scissors className="size-10" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col gap-1">
                      <h2 className="font-semibold text-foreground line-clamp-1">
                        {est.name}
                      </h2>
                      {est.address ? (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground line-clamp-2">
                          <MapPin className="size-4 shrink-0" aria-hidden />
                          {est.address}
                        </p>
                      ) : null}
                      <div className="mt-2">
                        <TypeBadge type={est.establishment_type} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
