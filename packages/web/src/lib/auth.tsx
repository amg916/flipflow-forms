'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Org {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  currentOrg: Org | null;
  orgs: Org[];
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentOrg: null,
  orgs: [],
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (!meRes.ok) {
          setLoading(false);
          return;
        }
        const userData = await meRes.json();
        setUser(userData);

        try {
          const orgsRes = await fetch(`${API_URL}/orgs`, { credentials: 'include' });
          if (orgsRes.ok) {
            const orgsData = await orgsRes.json();
            setOrgs(orgsData);
            if (orgsData.length > 0) {
              setCurrentOrg(orgsData[0]);
            }
          }
        } catch {
          // orgs endpoint not available
        }
      } catch {
        // not authenticated
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    setUser(null);
    setOrgs([]);
    setCurrentOrg(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, currentOrg, orgs, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
