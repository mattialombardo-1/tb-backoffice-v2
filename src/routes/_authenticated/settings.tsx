import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FlaskConical, CheckCircle2, ChevronRight, Globe } from 'lucide-react';
import { useRealCapabilities, can } from '@/lib/auth';
import { useImpersonation } from '@/lib/debug/roleImpersonation';
import { useCommunityRoles } from '@/lib/hooks/useCommunityRoles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CommunityRole } from '@/lib/types/communityRoles';

// ---- Capability chips ----

function CapabilityChips({ role }: { role: CommunityRole }) {
  const { t } = useTranslation();
  if (role.capabilities.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">
        {t('settings.roleSimulation.noCapabilities')}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {role.capabilities.map((cap) => (
        <span
          key={cap.resource}
          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono bg-muted text-muted-foreground"
        >
          {cap.resource}
          <span className="ml-1 text-muted-foreground/60">[{cap.actions.join(', ')}]</span>
        </span>
      ))}
    </div>
  );
}

// ---- Role card ----

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: CommunityRole;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-lg border p-4 transition-colors hover:bg-accent/50',
        selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{role.displayName}</span>
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              Rank {role.rank}
            </Badge>
          </div>
          {role.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{role.description}</p>
          )}
          <CapabilityChips role={role} />
        </div>
        <div className="shrink-0 mt-0.5">
          {selected ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
          )}
        </div>
      </div>
    </button>
  );
}

// ---- Language section ----

function LanguageSection() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{t('settings.language.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.language.desc')}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant={currentLang === 'it' ? 'default' : 'outline'}
          size="sm"
          onClick={() => i18n.changeLanguage('it')}
        >
          🇮🇹 {t('settings.language.it')}
        </Button>
        <Button
          variant={currentLang === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => i18n.changeLanguage('en')}
        >
          🇬🇧 {t('settings.language.en')}
        </Button>
      </div>
    </div>
  );
}

// ---- Role simulation section (admin-only) ----

function RoleSimulationSection() {
  const { t } = useTranslation();
  const { roles, isLoading } = useCommunityRoles();
  const { impersonatedRole, impersonate, clear } = useImpersonation();

  const sorted = [...roles].sort((a, b) => a.rank - b.rank);

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
          <FlaskConical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{t('settings.roleSimulation.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.roleSimulation.desc')}</p>
        </div>
      </div>

      {/* Active state */}
      {impersonatedRole && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <FlaskConical className="h-4 w-4" />
            <span>
              {t('settings.roleSimulation.active')}{' '}
              <strong>{impersonatedRole.displayName}</strong>
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={clear} className="h-7 text-xs">
            {t('settings.roleSimulation.end')}
          </Button>
        </div>
      )}

      {/* Role list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          {t('settings.roleSimulation.noRoles')}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((role) => {
            const isSelected = impersonatedRole?._id === role._id;
            return (
              <RoleCard
                key={role._id}
                role={role}
                selected={isSelected}
                onSelect={() => (isSelected ? clear() : impersonate(role))}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Route ----

function SettingsPage() {
  const { t } = useTranslation();
  const realCaps = useRealCapabilities();
  const isAdmin = can(realCaps, 'community-roles', 'UPDATE');

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <LanguageSection />

      {isAdmin && <RoleSimulationSection />}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/settings')({
  component: SettingsPage,
});
