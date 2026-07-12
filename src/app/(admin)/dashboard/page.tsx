'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const bookingRef = collection(db, 'bookings');
        
        // Total bookings
        const totalQuery = query(bookingRef);
        const totalSnap = await getDocs(totalQuery);
        
        // Pending bookings
        const pendingQuery = query(bookingRef, where('status', '==', 'pending'));
        const pendingSnap = await getDocs(pendingQuery);
        
        // Completed bookings
        const completedQuery = query(bookingRef, where('status', '==', 'completed'));
        const completedSnap = await getDocs(completedQuery);

        setStats({
          totalBookings: totalSnap.size,
          pendingBookings: pendingSnap.size,
          completedBookings: completedSnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5016]"></div>
        <span className="ml-3 text-gray-500 font-medium">Loading statistics...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Bookings Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Bookings</h2>
          <p className="text-4xl font-extrabold text-[#2D5016] mt-2">{stats.totalBookings}</p>
        </div>

        {/* Pending Bookings Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Estimations</h2>
          <p className="text-4xl font-extrabold text-[#E8B44D] mt-2">{stats.pendingBookings}</p>
        </div>

        {/* Completed Bookings Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Completed Service</h2>
          <p className="text-4xl font-extrabold text-emerald-600 mt-2">{stats.completedBookings}</p>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-[#2D5016] mb-2">Welcome to Paint Shop Admin Panel</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Use the navigation menu on the left to manage bookings, inventory levels, media showcase galleries, service catalogs, and customer messages.
        </p>
      </div>
    </div>
  );
}
