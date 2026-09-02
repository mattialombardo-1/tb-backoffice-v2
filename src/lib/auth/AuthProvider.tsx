import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User } from 'oidc-client-ts';
import { userManager } from './config';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userManager.getUser().then((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    const onUserLoaded = (u: User) => setUser(u);
    const onUserUnloaded = () => setUser(null);
    const onSilentRenewError = () => userManager.signinRedirect();

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);
    userManager.events.addSilentRenewError(onSilentRenewError);

    return () => {
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
      userManager.events.removeSilentRenewError(onSilentRenewError);
    };
  }, []);

  const login = () => {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    return userManager.signinRedirect();
  };

  const logout = async () => {
    try {
      await userManager.signoutRedirect({
        post_logout_redirect_uri: window.location.origin + '/login',
      });
    } catch {
      await userManager.removeUser();
      window.location.assign('/login');
    }
  };

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !user?.expired && !!user, login, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
