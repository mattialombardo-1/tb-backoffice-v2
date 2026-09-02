import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, FileQuestion, Library, PenSquare, Plus, Target } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/lib/auth';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { campaignsService } from '@/lib/services/campaignsService';
import { DIFFICULTY_LABELS, type QuestionListItem } from '@/lib/types/questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Attiva',
  DRAFT: 'Bozza',
  TO_REVIEW: 'In revisione',
  INACTIVE: 'Inattiva',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  ACTIVE: 'default',
  DRAFT: 'outline',
  TO_REVIEW: 'secondary',
  INACTIVE: 'destructive',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  TO_REVIEW: '#f59e0b',
  DRAFT: '#64748b',
  INACTIVE: '#ef4444',
};

const DIFFICULTY_ORDER: (keyof typeof DIFFICULTY_LABELS)[] = [
  'facile',
  'medio_facile',
  'medio',
  'medio_difficile',
  'difficile',
  'non_ancora_valutata',
];

function groupByWeek(questions: QuestionListItem[]): { week: string; domande: number }[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset - (7 - i) * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);
    const label = `${monday.getDate()}/${monday.getMonth() + 1}`;
    return { label, start: monday, end: sunday, count: 0 };
  });

  for (const q of questions) {
    const d = new Date(q.createdAt);
    for (const w of weeks) {
      if (d >= w.start && d < w.end) {
        w.count++;
        break;
      }
    }
  }

  return weeks.map((w) => ({ week: w.label, domande: w.count }));
}

function groupByDifficulty(questions: QuestionListItem[]): { name: string; domande: number }[] {
  const counts: Record<string, number> = {};
  for (const q of questions) counts[q.difficulty] = (counts[q.difficulty] ?? 0) + 1;
  return DIFFICULTY_ORDER.filter((d) => counts[d] !== undefined).map((d) => ({
    name: DIFFICULTY_LABELS[d],
    domande: counts[d],
  }));
}

const weeklyChartConfig: ChartConfig = {
  domande: { label: 'Domande', theme: { light: 'oklch(0.205 0 0)', dark: 'hsl(0 0% 100%)' } },
};

const difficultyChartConfig: ChartConfig = {
  domande: { label: 'Domande', theme: { light: 'oklch(0.205 0 0)', dark: 'hsl(0 0% 100%)' } },
};

function StatCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value?: number;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-2 h-9 w-16" />
        ) : (
          <p className="mt-1 text-4xl font-bold tabular-nums">{value ?? '—'}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardComponent() {
  const auth = useAuth();
  const client = useApiClient();
  const user = auth.user?.profile as Record<string, unknown> | undefined;
  const name = (user?.name as string)?.split(' ')[0] ?? 'ciao';

  const activeQ = useQuery({
    queryKey: ['dashboard', 'questions', 'ACTIVE'],
    queryFn: ({ signal }) =>
      questionsService.list(client, { statuses: ['ACTIVE'], page: 1, perPage: 1 }, signal),
  });

  const reviewQ = useQuery({
    queryKey: ['dashboard', 'questions', 'TO_REVIEW'],
    queryFn: ({ signal }) =>
      questionsService.list(client, { statuses: ['TO_REVIEW'], page: 1, perPage: 1 }, signal),
  });

  const draftQ = useQuery({
    queryKey: ['dashboard', 'questions', 'DRAFT'],
    queryFn: ({ signal }) =>
      questionsService.list(client, { statuses: ['DRAFT'], page: 1, perPage: 1 }, signal),
  });

  const inactiveQ = useQuery({
    queryKey: ['dashboard', 'questions', 'INACTIVE'],
    queryFn: ({ signal }) =>
      questionsService.list(client, { statuses: ['INACTIVE'], page: 1, perPage: 1 }, signal),
  });

  const myReviewsQ = useQuery({
    queryKey: ['dashboard', 'my-reviews'],
    queryFn: ({ signal }) => questionsService.myReviews(client, signal),
  });

  const recentQ = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: ({ signal }) => questionsService.list(client, { page: 1, perPage: 5 }, signal),
  });

  const chartDataQ = useQuery({
    queryKey: ['dashboard', 'chart-data'],
    queryFn: ({ signal }) => questionsService.list(client, { page: 1, perPage: 200 }, signal),
  });

  const campaignsQ = useQuery({
    queryKey: ['dashboard', 'campaigns'],
    queryFn: ({ signal }) => campaignsService.list(client, { page: 1, limit: 3 }, signal),
  });

  const weeklyData = chartDataQ.data ? groupByWeek(chartDataQ.data.questions) : [];
  const difficultyData = chartDataQ.data ? groupByDifficulty(chartDataQ.data.questions) : [];

  const statusDonutData = [
    { name: 'ACTIVE', label: 'Attive', value: activeQ.data?.total ?? 0 },
    { name: 'TO_REVIEW', label: 'In revisione', value: reviewQ.data?.total ?? 0 },
    { name: 'DRAFT', label: 'Bozze', value: draftQ.data?.total ?? 0 },
    { name: 'INACTIVE', label: 'Inattive', value: inactiveQ.data?.total ?? 0 },
  ].filter((d) => d.value > 0);

  const statusChartConfig: ChartConfig = Object.fromEntries(
    statusDonutData.map((d) => [d.name, { label: d.label, color: STATUS_COLORS[d.name] }]),
  );

  const chartsLoading = chartDataQ.isLoading;
  const statusLoading =
    activeQ.isLoading || reviewQ.isLoading || draftQ.isLoading || inactiveQ.isLoading;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-8 py-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Ciao, {name}!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ecco un riepilogo dell'attività del backoffice.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Domande attive" value={activeQ.data?.total} isLoading={activeQ.isLoading} />
        <StatCard label="In revisione" value={reviewQ.data?.total} isLoading={reviewQ.isLoading} />
        <StatCard
          label="Mie revisioni"
          value={myReviewsQ.data?.length}
          isLoading={myReviewsQ.isLoading}
        />
        <StatCard label="Bozze" value={draftQ.data?.total} isLoading={draftQ.isLoading} />
      </div>
      
      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Azioni rapide</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/questions/create">
              <Plus className="h-4 w-4" />
              Crea domanda
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/questions/to-review">
              <ClipboardCheck className="h-4 w-4" />
              Le mie revisioni
              {(myReviewsQ.data?.length ?? 0) > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs">{myReviewsQ.data!.length}</Badge>
              )}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/collections">
              <Library className="h-4 w-4" />
              Collezioni
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/questions">
              <FileQuestion className="h-4 w-4" />
              Tutte le domande
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly creation bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Domande create per settimana</CardTitle>
            <p className="text-xs text-muted-foreground">Ultime 8 settimane</p>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ChartContainer config={weeklyChartConfig} className="h-48 w-full">
                <BarChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
                  <Bar dataKey="domande" fill="var(--color-domande)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Status donut chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuzione per stato</CardTitle>
            <p className="text-xs text-muted-foreground">Totale per stato</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {statusLoading ? (
              <Skeleton className="h-36 w-36 rounded-full" />
            ) : (
              <>
                <ChartContainer config={statusChartConfig} className="h-36 w-full">
                  <PieChart>
                    <Pie
                      data={statusDonutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={62}
                      paddingAngle={2}
                    >
                      {statusDonutData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="name"
                          formatter={(value, name) => (
                            <span className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">
                                {STATUS_LABEL[name as string] ?? name}
                              </span>
                              <span className="font-mono font-medium tabular-nums text-foreground">
                                {value as number}
                              </span>
                            </span>
                          )}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                  {statusDonutData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="h-2 w-2 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: STATUS_COLORS[d.name] }}
                      />
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-medium tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Difficulty distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Distribuzione per difficoltà</CardTitle>
          <p className="text-xs text-muted-foreground">Ultime 200 domande</p>
        </CardHeader>
        <CardContent>
          {chartsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <ChartContainer config={difficultyChartConfig} className="h-40 w-full">
              <BarChart
                data={difficultyData}
                layout="vertical"
                margin={{ top: 4, right: 4, bottom: 4, left: 8 }}
              >
                <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
                <Bar dataKey="domande" fill="var(--color-domande)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Campagne di produzione</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/campaigns">Vedi tutte</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {campaignsQ.isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <Skeleton className="mb-3 h-4 w-48" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          ) : campaignsQ.data?.campaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Target className="h-8 w-8 opacity-30" />
              <p className="text-sm">Nessuna campagna attiva.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {campaignsQ.data?.campaigns.map((c) => {
                const completed = c.totalQuestions - c.remainingQuestions;
                const pct = c.totalQuestions > 0 ? Math.round((completed / c.totalQuestions) * 100) : 0;
                return (
                  <li key={c.id}>
                    <Link
                      to="/campaigns/$campaignId"
                      params={{ campaignId: c.id }}
                      className="block px-6 py-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {completed} / {c.totalQuestions}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent questions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Domande recenti</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/questions">Vedi tutte</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentQ.isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-20 shrink-0" />
                </div>
              ))}
            </div>
          ) : recentQ.data?.questions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <PenSquare className="h-8 w-8 opacity-30" />
              <p className="text-sm">Nessuna domanda ancora.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {recentQ.data?.questions.map((q) => (
                <li key={q.id}>
                  <Link
                    to="/questions/$questionId"
                    params={{ questionId: q.id }}
                    search={{ review: undefined }}
                    className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-accent/50"
                  >
                    <span className="flex-1 truncate text-sm text-foreground">
                      {q.questionText?.trim() || (
                        <span className="italic text-muted-foreground">Senza testo</span>
                      )}
                    </span>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {q.materiaName && <span>{q.materiaName}</span>}
                      <Badge variant={STATUS_VARIANT[q.status] ?? 'outline'}>
                        {STATUS_LABEL[q.status] ?? q.status}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardComponent,
});
