'use client';

import { AuthProvider } from '@/lib/auth';

export default function DashboardProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
