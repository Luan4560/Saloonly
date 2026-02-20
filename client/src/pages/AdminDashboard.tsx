import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Building2, Scissors, Users, Calendar } from "lucide-react";
import { getAppointments } from "@/lib/api";
import { formatDateOnlyUTC } from "@/lib/utils";
import { useEffect, useState } from "react";

const cards = [
  {
    title: "Meu negócio",
    description: "Edite os dados do seu negócio",
    href: "/establishments",
    icon: Building2,
  },
  {
    title: "Serviços",
    description: "Defina serviços, preços e duração",
    href: "/services",
    icon: Scissors,
  },
  {
    title: "Colaboradores",
    description: "Gerencie a equipe do salão",
    href: "/collaborators",
    icon: Users,
  },
  {
    title: "Agendamentos",
    description: "Veja e gerencie os agendamentos",
    href: "/appointments",
    icon: Calendar,
  },
];

export default function AdminDashboard() {
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [weekCount, setWeekCount] = useState<number | null>(null);
  const [nextAppointments, setNextAppointments] = useState<
    { id: string; appointment_date: string; establishment?: { name: string }; collaborator?: { name: string } }[]
  >([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const dateFrom = today.toISOString().split("T")[0];
    const dateToWeek = weekEnd.toISOString().split("T")[0];

    Promise.all([
      getAppointments({ date_from: dateFrom, date_to: dateFrom }),
      getAppointments({ date_from: dateFrom, date_to: dateToWeek }),
    ])
      .then(([todayList, weekList]) => {
        const todayArr = Array.isArray(todayList) ? todayList : [];
        const weekArr = Array.isArray(weekList) ? weekList : [];
        setTodayCount(todayArr.length);
        setWeekCount(weekArr.length);
        const sorted = [...weekArr].sort(
          (a, b) =>
            new Date(a.appointment_date).getTime() -
            new Date(b.appointment_date).getTime()
        );
        setNextAppointments(
          sorted
            .filter((a) => a.status !== "CANCELED")
            .slice(0, 5)
        );
      })
      .catch(() => {
        setTodayCount(0);
        setWeekCount(0);
      });
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Painel Saloonly</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao painel de gestão. Resumo e atalhos abaixo.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 text-card-foreground">
            <p className="text-sm text-muted-foreground">Agendamentos hoje</p>
            <p className="text-2xl font-semibold">
              {todayCount !== null ? todayCount : "—"}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground">
            <p className="text-sm text-muted-foreground">Esta semana</p>
            <p className="text-2xl font-semibold">
              {weekCount !== null ? weekCount : "—"}
            </p>
          </div>
        </div>

        {nextAppointments.length > 0 && (
          <div className="mt-6 rounded-lg border bg-card p-4">
            <h2 className="font-medium mb-3">Próximos agendamentos</h2>
            <ul className="space-y-2 text-sm">
              {nextAppointments.map((a) => (
                <li key={a.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {formatDateOnlyUTC(a.appointment_date)}
                  </span>
                  <span>
                    {a.establishment?.name ?? "-"} · {a.collaborator?.name ?? "-"}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/appointments"
              className="mt-3 inline-block text-sm text-primary hover:underline"
            >
              Ver todos os agendamentos →
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          {cards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="flex flex-col rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <card.icon className="h-8 w-8 mb-3 text-muted-foreground" />
              <h2 className="text-lg font-medium">{card.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
