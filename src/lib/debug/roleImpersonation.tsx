import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CommunityRole } from '@/lib/types/communityRoles';
import { CapabilitiesOverrideContext, useRealCapabilities } from '@/lib/auth/capabilities';
import type { CapabilitiesSnapshot } from '@/lib/auth/capabilities';

const SESSION_KEY = '__debug_impersonated_role__';

export interface ImpersonationValue {
  impersonatedRole: CommunityRole | null;
  impersonate: (role: CommunityRole) => void;
  clear: () => void;
}

const ImpersonationContext = createContext<ImpersonationValue>({
  impersonatedRole: null,
  impersonate: () => {},
  clear: () => {},
});

function roleToSnapshot(role: CommunityRole, me: CapabilitiesSnapshot['me']): CapabilitiesSnapshot {
  const index = new Map<string, Set<string>>();
  for (const cap of role.capabilities) {
    index.set(cap.resource, new Set(cap.actions));
  }
  // Preserve real `me` so components that use caps.me for user info keep working.
  return { index, state: 'ready', me };
}

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const realCaps = useRealCapabilities();

  const [impersonatedRole, setImpersonatedRole] = useState<CommunityRole | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as CommunityRole) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (impersonatedRole) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(impersonatedRole));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [impersonatedRole]);

  const override = impersonatedRole ? roleToSnapshot(impersonatedRole, realCaps.me) : null;

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedRole,
        impersonate: setImpersonatedRole,
        clear: () => setImpersonatedRole(null),
      }}
    >
      <CapabilitiesOverrideContext.Provider value={override}>
        {children}
      </CapabilitiesOverrideContext.Provider>
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation(): ImpersonationValue {
  return useContext(ImpersonationContext);
}
