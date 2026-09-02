import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { useApiClient } from '@/lib/api/useApiClient';
import { meService } from '@/lib/services/me';
import type { Action, Capability, MeResponse, Resource } from '@/lib/types/me';

// Internal index: resource → Set<action>. Built once per /community-profile
// response so `can()` is O(1) and never re-scans the array.
type CapabilityIndex = Map<string, Set<string>>;

function indexCapabilities(caps: Capability[]): CapabilityIndex {
  const idx: CapabilityIndex = new Map();
  for (const cap of caps) {
    const set = idx.get(cap.resource) ?? new Set<string>();
    for (const a of cap.actions) set.add(a);
    idx.set(cap.resource, set);
  }
  return idx;
}

export interface CapabilitiesSnapshot {
  // Stable index for `can()` lookups. Empty until the first /community-profile
  // resolves (or stays empty if it 404s — see `state`).
  index: CapabilityIndex;
  // Lifecycle: 'idle' before auth, 'loading' during fetch, 'ready' after a
  // successful fetch, 'error' after a failed one. Guards can decide whether
  // to render a spinner or fail closed.
  state: 'idle' | 'loading' | 'ready' | 'error';
  // The raw response. Useful if a screen needs the CommunityUser doc itself.
  me: MeResponse | null;
}

const EMPTY_SNAPSHOT: CapabilitiesSnapshot = {
  index: new Map(),
  state: 'idle',
  me: null,
};

// Pure predicate — no React. Safe to call from `beforeLoad` guards, hooks,
// event handlers, anywhere.
export function can(snapshot: CapabilitiesSnapshot, resource: Resource, action: Action): boolean {
  const actions = snapshot.index.get(resource);
  return !!actions && actions.has(action);
}

// ---------- React context ----------------------------------------------------

const CapabilitiesContext = createContext<CapabilitiesSnapshot>(EMPTY_SNAPSHOT);

// Injected by ImpersonationProvider when a debug role override is active.
// null means no override — use the real snapshot.
export const CapabilitiesOverrideContext = createContext<CapabilitiesSnapshot | null>(null);

export function CapabilitiesProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const client = useApiClient();
  const [snapshot, setSnapshot] = useState<CapabilitiesSnapshot>(EMPTY_SNAPSHOT);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setSnapshot(EMPTY_SNAPSHOT);
      return;
    }

    const controller = new AbortController();
    setSnapshot((prev) => ({ ...prev, state: 'loading' }));

    meService
      .profile(client, controller.signal)
      .then((me) => {
        if (controller.signal.aborted) return;
        setSnapshot({ index: indexCapabilities(me.capabilities), state: 'ready', me });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        // Don't clobber an existing ready snapshot on transient failures —
        // keep the last-known-good capabilities and just mark state.
        console.error('Failed to fetch /community-profile:', err);
        setSnapshot((prev) => ({ ...prev, state: 'error' }));
      });

    return () => controller.abort();
  }, [auth.isAuthenticated, client]);

  return <CapabilitiesContext.Provider value={snapshot}>{children}</CapabilitiesContext.Provider>;
}

// In-React hook. Returns the effective snapshot: the debug override when
// ImpersonationProvider has one active, otherwise the real snapshot.
export function useCapabilities(): CapabilitiesSnapshot {
  const override = useContext(CapabilitiesOverrideContext);
  const real = useContext(CapabilitiesContext);
  return override ?? real;
}

// Always returns the real (non-impersonated) snapshot. Use this for
// admin guards that must not be bypassable via role impersonation.
export function useRealCapabilities(): CapabilitiesSnapshot {
  return useContext(CapabilitiesContext);
}

// Ergonomic wrapper for the common case.
export function useCan(resource: Resource, action: Action): boolean {
  const snap = useCapabilities();
  return useMemo(() => can(snap, resource, action), [snap, resource, action]);
}
