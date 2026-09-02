import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { userManager } from '../lib/auth/config';

function CallbackComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then(() => {
        const redirect = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate({ to: redirect });
      })
      .catch((err: unknown) => {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : t('auth.callback.error'));
      });
  }, [navigate, t]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.errorIcon}>✗</div>
          <p style={styles.errorMessage}>{t('auth.callback.errorHeading')}</p>
          <p style={styles.errorDetail}>{error}</p>
          <button onClick={() => navigate({ to: '/login' })} style={styles.retryButton}>
            {t('auth.callback.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner}>
          <div style={styles.spinnerCircle} />
        </div>
        <p style={styles.message}>{t('auth.callback.loading')}</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/callback')({
  component: CallbackComponent,
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
  spinner: { display: 'flex', justifyContent: 'center', marginBottom: '1rem' },
  spinnerCircle: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  message: { fontSize: '1rem', color: '#666', marginTop: '1rem' },
  errorIcon: { fontSize: '3rem', color: '#dc2626', marginBottom: '1rem' },
  errorMessage: { fontSize: '1.25rem', fontWeight: 'bold' as const, color: '#dc2626', marginBottom: '0.5rem' },
  errorDetail: { fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' },
  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    width: '100%',
  },
};
