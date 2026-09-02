import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { useEffect } from 'react';

interface LoginSearch {
  redirect?: string;
}

function LoginComponent() {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const { redirect: redirectUrl } = Route.useSearch();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate({ to: redirectUrl || '/dashboard' });
    }
  }, [auth.isAuthenticated, redirectUrl, navigate]);

  const handleLogin = () => auth.login();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{t('auth.login.title')}</h1>
        <p style={styles.message}>{t('auth.login.desc')}</p>
        <button onClick={handleLogin} style={styles.button} data-testid="login-button">
          {t('auth.login.button')}
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: (search.redirect as string) || undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: (search as LoginSearch).redirect || '/dashboard' });
    }
  },
  component: LoginComponent,
});

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const,
  },
  title: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' },
  message: { fontSize: '1rem', marginBottom: '1.5rem', color: '#666' },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
  },
};
