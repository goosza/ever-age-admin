import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  secret: string | null;
  login: (secret: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Secret is stored ONLY in memory — never in localStorage
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [secret, setSecret] = useState<string | null>(
    // Allow pre-filling from env in dev only
    import.meta.env.DEV ? (import.meta.env.VITE_ADMIN_SECRET ?? null) : null
  );

  const login = (s: string) => setSecret(s);
  const logout = () => setSecret(null);

  return (
    <AuthContext.Provider value={{ secret, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
