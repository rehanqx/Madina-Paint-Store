'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { currentUser, adminUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser && adminUser) {
        // User is logged in and is admin
        console.log("Redirecting to dashboard...");
        router.push('/admin/dashboard');
      } else {
        // User not logged in or not admin
        console.log("Redirecting to login...");
        router.push('/admin/login');
      }
    }
  }, [currentUser, adminUser, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
