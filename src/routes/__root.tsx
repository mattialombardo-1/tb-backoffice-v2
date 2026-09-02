/**
 * Root Route
 *
 * This is the root layout for all routes in the application.
 * It provides the base structure and context for child routes.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import type { RouterContext } from '../router';

/**
 * Root route component
 * Renders the outlet for child routes
 */
function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

/**
 * Create root route with authentication context
 *
 * This route provides the base structure for the entire application
 * and makes the authentication context available to all child routes.
 */
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
