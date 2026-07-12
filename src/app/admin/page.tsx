'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPageRedirect() {
  const { adminUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (adminUser) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [adminUser, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016] mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Checking authorization...</p>
      </div>
    </div>
  );
}
