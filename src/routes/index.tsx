/**
 * Index Route
 *
 * This route redirects to the dashboard for authenticated users
 * or to login for unauthenticated users.
 */

import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Index route configuration
 *
 * Redirects to appropriate destination based on authentication status
 */
export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    } else {
      throw redirect({ to: '/login' });
    }
  },
});
