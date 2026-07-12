'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, adminUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser || !adminUser) {
        router.push('/admin/login');
      }
    }
  }, [currentUser, adminUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !adminUser) {
    return null;
  }

  return <>{children}</>;
}
