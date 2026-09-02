import { useState } from 'react';
import { Joyride, STATUS, type Step, type EventData, type TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link, Outlet, redirect, useMatches } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth, useCapabilities, can } from '../lib/auth';
import type { CapabilitiesSnapshot } from '../lib/auth';
import {
  UserRound,
  FileQuestion,
  PenLine,
  ClipboardCheck,
  ChevronDown,
  ShieldUser,
  Shield,
  Sun,
  Moon,
  ShieldOff,
  Loader2,
  ClipboardList,
  BookOpen,
  Package,
  Database,
  LogOut,
  Settings,
  FlaskConical,
  X,
  NotebookPen,
  Library,
  Tag,
  Megaphone,
  CircleHelp,
  PanelRightOpen,
  PanelRightClose,
  LayoutDashboard,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useImpersonation } from '@/lib/debug/roleImpersonation';
import type { Action, Resource } from '@/lib/types/me';

// --- Nav types ---
interface RequiredCapability {
  resource: Resource;
  action: Action;
}

interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredCapability?: RequiredCapability;
}

interface NavSection {
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavItem[];
}

type NavEntry = NavItem | NavSection;

function isSection(entry: NavEntry): entry is NavSection {
  return 'children' in entry;
}

function isAllowed(caps: CapabilitiesSnapshot, item: NavItem): boolean {
  return (
    !item.requiredCapability ||
    can(caps, item.requiredCapability.resource, item.requiredCapability.action)
  );
}

const navEntries: NavEntry[] = [
  { to: '/dashboard', labelKey: 'nav.home', icon: LayoutDashboard },
  {
    to: '/staff',
    labelKey: 'nav.staff',
    icon: ShieldUser,
    requiredCapability: { resource: 'community-users', action: 'READ' },
  },
  {
    to: '/roles',
    labelKey: 'nav.roles',
    icon: Shield,
    requiredCapability: { resource: 'community-roles', action: 'READ' },
  },
  // Clienti hits the legacy /users surface (old User model, brand-scoped
  // permissions). No equivalent in the new community-* capability vocabulary
  // yet — leave ungated until product/backend decide how it maps.
  { to: '/clients', labelKey: 'nav.clients', icon: UserRound },
  {
    to: '/collections',
    labelKey: 'nav.collections',
    icon: Library,
    requiredCapability: { resource: 'collections', action: 'READ' },
  },
  {
    to: '/questions',
    labelKey: 'nav.questions',
    icon: FileQuestion,
    requiredCapability: { resource: 'questions', action: 'READ' },
  },
  {
    to: '/subjects',
    labelKey: 'nav.subjects',
    icon: BookOpen,
    requiredCapability: { resource: 'subjects', action: 'READ' },
  },
  {
    to: '/campaigns',
    labelKey: 'nav.campaigns',
    icon: NotebookPen,
    requiredCapability: { resource: 'campaigns', action: 'READ' },
  },
  {
    to: '/my-slots',
    labelKey: 'nav.mySlots',
    icon: PenLine,
    requiredCapability: { resource: 'campaigns', action: 'READ' },
  },
  {
    to: '/questions/to-review',
    labelKey: 'nav.myReviews',
    icon: ClipboardCheck,
    requiredCapability: { resource: 'questions', action: 'READ' },
  },
  {
    to: '/pools',
    labelKey: 'nav.pools',
    icon: Database,
    requiredCapability: { resource: 'pools', action: 'READ' },
  },
  {
    to: '/packages',
    labelKey: 'nav.packages',
    icon: Package,
    requiredCapability: { resource: 'packages', action: 'READ' },
  },
  {
    to: '/tests',
    labelKey: 'nav.tests',
    icon: ClipboardList,
    requiredCapability: { resource: 'tests', action: 'READ' },
  },
  {
    to: '/attributes',
    labelKey: 'nav.attributes',
    icon: Tag,
    requiredCapability: { resource: 'attributes', action: 'READ' },
  },
];

const linkClass =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground';

function CollapsibleNavSection({
  section,
  caps,
  collapsed,
}: {
  section: NavSection;
  caps: CapabilitiesSnapshot;
  collapsed: boolean;
}) {
  const { t } = useTranslation();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname;
  const visibleChildren = section.children.filter((child) => isAllowed(caps, child));
  const isChildActive = visibleChildren.some((child) => child.to === currentPath);
  const [open, setOpen] = useState(isChildActive);

  if (visibleChildren.length === 0) return null;
  if (collapsed) return null;

  const Icon = section.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
          isChildActive && 'text-accent-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{t(section.labelKey)}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="ml-4 space-y-1 border-l pl-3">
          {visibleChildren.map(({ to, labelKey, icon: ChildIcon }) => (
            <Link key={to} to={to} className={linkClass} activeOptions={{ exact: true }}>
              <ChildIcon className="h-4 w-4" />
              {t(labelKey)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TourTooltip({
  index,
  size,
  step,
  isLastStep,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      className="bg-background border border-border rounded-xl shadow-xl w-80 p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          {step.title && (
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
          )}
          <p className="text-xs text-muted-foreground">{index + 1} di {size}</p>
        </div>
        <button
          {...closeProps}
          className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((index + 1) / size) * 100}%` }}
        />
      </div>

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed">{step.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          {...skipProps}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Salta tour
        </button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button {...backProps} variant="outline" size="sm">
              Indietro
            </Button>
          )}
          <Button {...primaryProps} size="sm">
            {isLastStep ? 'Fine' : 'Avanti'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Benvenuto nel Backoffice',
    content: 'Questa è la barra di navigazione. Da qui accedi a tutte le sezioni del gestionale.',
    placement: 'right',
    skipBeacon: true,
  },
  {
    target: '[data-tour="nav-questions"]',
    title: 'Domande',
    content: 'Crea, modifica e filtra le domande del database. Puoi assegnarle a un revisore prima di pubblicarle.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-to-review"]',
    title: 'Le mie revisioni',
    content: 'Le domande assegnate a te in attesa di approvazione. Puoi approvarle o rimandarle in bozza.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-collections"]',
    title: 'Collections',
    content: 'Raggruppa le domande in collezioni tematiche da assegnare ai test e ai pacchetti.',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-staff"]',
    title: 'Staff',
    content: 'Gestisci i membri del team, i loro ruoli e le relative autorizzazioni.',
    placement: 'right',
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Tema',
    content: 'Puoi passare tra tema chiaro e scuro in qualsiasi momento.',
    placement: 'right',
  },
  {
    target: '[data-tour="tour-btn"]',
    title: 'Riaprire il tour',
    content: 'Puoi riaprire questo tour guidato in qualsiasi momento cliccando qui.',
    placement: 'right',
  },
];

function AuthenticatedLayout() {
  const { t } = useTranslation();
  const auth = useAuth();
  const caps = useCapabilities();
  const { theme, toggleTheme } = useTheme();
  const { impersonatedRole, clear: clearImpersonation } = useImpersonation();
  const user = auth.user?.profile as Record<string, unknown> | undefined;
  const [tourRunning, setTourRunning] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleTourEvent = (data: EventData) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setTourRunning(false);
    }
  };
  if (caps.state === 'idle' || caps.state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (caps.state === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShieldOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{t('auth.unauthorized')}</h1>
          <p className="max-w-sm text-sm text-muted-foreground">{t('auth.unauthorizedDesc')}</p>
        </div>
        <button
          onClick={() => auth.logout()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t('auth.logout')}
        </button>
      </div>
    );
  }

  const filteredNavEntries = navEntries.filter((entry) =>
    isSection(entry) ? true : isAllowed(caps, entry)
  );

  return (
    <div className="flex max-h-screen">
      <Joyride
        steps={TOUR_STEPS}
        run={tourRunning}
        continuous
        tooltipComponent={TourTooltip}
        onEvent={handleTourEvent}
        styles={{ arrow: { display: 'none' } }}
      />

      {/* Sidebar */}
      <TooltipProvider delayDuration={200}>
      <aside data-tour="sidebar" className={cn("flex flex-col border-r bg-card min-h-screen transition-all duration-200 overflow-hidden", sidebarCollapsed ? "w-14" : "w-64")}>
        {/* Title + toggle */}
        <div className={cn("border-b relative", sidebarCollapsed ? "flex justify-center px-2 py-[18px]" : "p-6 pr-10")}>
          {!sidebarCollapsed && <h1 className="text-lg font-semibold">{t('nav.title')}</h1>}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className={cn(
              "rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
              !sidebarCollapsed && "absolute right-4 top-1/2 -translate-y-1/2"
            )}
            aria-label={sidebarCollapsed ? 'Espandi sidebar' : 'Chiudi sidebar'}
          >
            {sidebarCollapsed ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>

        {/* Impersonation banner */}
        {impersonatedRole && (
          <div className="border-b bg-amber-50 px-4 py-2 dark:bg-amber-950/30">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="flex-1 truncate text-xs text-amber-800 dark:text-amber-300">
                <span className="font-medium">{impersonatedRole.displayName}</span>
              </span>
              <button
                type="button"
                onClick={clearImpersonation}
                className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-100"
                aria-label={t('impersonation.endAria')}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-1 p-2", !sidebarCollapsed && "p-4")}>
          {filteredNavEntries.map((entry) =>
            isSection(entry) ? (
              <CollapsibleNavSection key={entry.labelKey} section={entry} caps={caps} collapsed={sidebarCollapsed} />
            ) : sidebarCollapsed ? (
              <Tooltip key={entry.to}>
                <TooltipTrigger asChild>
                  <Link
                    to={entry.to}
                    className="flex justify-center rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
                    activeOptions={{ exact: true }}
                  >
                    <entry.icon className="h-4 w-4 shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="[&>svg]:hidden">{t(entry.labelKey)}</TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={entry.to}
                to={entry.to}
                className={linkClass}
                activeOptions={{ exact: true }}
                data-tour={
                  entry.to === '/questions' ? 'nav-questions' :
                  entry.to === '/questions/to-review' ? 'nav-to-review' :
                  entry.to === '/collections' ? 'nav-collections' :
                  entry.to === '/staff' ? 'nav-staff' :
                  undefined
                }
              >
                <entry.icon className="h-4 w-4 shrink-0" />
                {t(entry.labelKey)}
              </Link>
            )
          )}
        </nav>

        {!sidebarCollapsed && (
          <div className="px-6 py-4">
            <p className="text-sm font-medium truncate">
              {(user?.name as string) ?? t('auth.userFallback')}
            </p>
            <p className="text-xs text-muted-foreground truncate">{(user?.email as string) ?? ''}</p>
          </div>
        )}

        {/* Theme + Settings + Logout */}
        <div className={cn("border-t space-y-1", sidebarCollapsed ? "p-2" : "p-4")}>
          {sidebarCollapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://forms.clickup.com/9004098635/f/8caz92b-54495/O2DGN6CULCSNRW9TLG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full justify-center rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Megaphone className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right" className="[&>svg]:hidden">Invia segnalazione</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button data-tour="theme-toggle" onClick={toggleTheme} className="flex w-full justify-center rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="[&>svg]:hidden">{theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button data-tour="tour-btn" onClick={() => setTourRunning(true)} className="flex w-full justify-center rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="[&>svg]:hidden">Tour guidato</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/settings" className="flex w-full justify-center rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground">
                    <Settings className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="[&>svg]:hidden">{t('nav.settings')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => auth.logout()} className="flex w-full justify-center rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="[&>svg]:hidden">{t('common.signOut')}</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <a
                href="https://forms.clickup.com/9004098635/f/8caz92b-54495/O2DGN6CULCSNRW9TLG"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Megaphone className="h-4 w-4" />
                Invia segnalazione
              </a>
              <button
                data-tour="theme-toggle"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
              </button>
              {/* <button
                data-tour="tour-btn"
                onClick={() => setTourRunning(true)}
                className="flex w-full items-center gap-3 cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <CircleHelp className="h-4 w-4" />
                Tour guidato
              </button> */}
              <Link
                to="/settings"
                className={cn(linkClass, '[&.active]:bg-accent [&.active]:text-accent-foreground')}
              >
                <Settings className="h-4 w-4" />
                {t('nav.settings')}
              </Link>
              <button
                onClick={() => auth.logout()}
                className="w-full rounded-md px-3 py-2 text-sm cursor-pointer gap-3 font-medium flex items-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut size={16} />
                {t('common.signOut')}
              </button>
            </>
          )}
        </div>
      </aside>
      </TooltipProvider>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});
