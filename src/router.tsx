/**
 * TanStack Router Configuration
 *
 * This file configures the router with authentication context
 * and creates the router instance.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import type { AuthContextValue, CapabilitiesSnapshot } from './lib/auth';

/**
 * Router context interface
 * Provides authentication + capability state to all routes
 */
export interface RouterContext {
  auth: AuthContextValue;
  capabilities: CapabilitiesSnapshot;
}

/**
 * Create and configure the router instance
 *
 * The router is configured with:
 * - Authentication context for protected routes
 * - Route tree generated from file-based routing
 */
export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // This will be set by the RouterProvider
    capabilities: undefined!, // This will be set by the RouterProvider
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

/**
 * Type declaration for router
 * This enables type-safe routing throughout the application
 */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
