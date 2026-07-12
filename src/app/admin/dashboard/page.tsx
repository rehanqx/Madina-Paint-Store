'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  serviceType: string;
  bookingDate: string;
  status: string;
  createdAt: any;
}

export default function DashboardPage() {
  const { adminUser } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    unreadMessages: 0,
    totalServices: 0,
    totalGallery: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const bookingRef = collection(db, 'bookings');
        const messagesRef = collection(db, 'messages');
        const servicesRef = collection(db, 'services');
        const galleryRef = collection(db, 'gallery');

        const [
          bookingsSnap,
          pendingSnap,
          completedSnap,
          unreadSnap,
          servicesSnap,
          gallerySnap,
          recentSnap
        ] = await Promise.all([
          getDocs(query(bookingRef)),
          getDocs(query(bookingRef, where('status', '==', 'pending'))),
          getDocs(query(bookingRef, where('status', '==', 'completed'))),
          getDocs(query(messagesRef, where('status', '==', 'unread'))),
          getDocs(query(servicesRef)),
          getDocs(query(galleryRef)),
          getDocs(query(bookingRef, orderBy('createdAt', 'desc'), limit(5)))
        ]);

        setStats({
          totalBookings: bookingsSnap.size,
          pendingBookings: pendingSnap.size,
          completedBookings: completedSnap.size,
          unreadMessages: unreadSnap.size,
          totalServices: servicesSnap.size,
          totalGallery: gallerySnap.size,
        });

        const recentData = recentSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[];
        setRecentBookings(recentData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5016]"></div>
        <span className="ml-3 text-gray-500 font-semibold">Loading dashboard summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-[#2D5016] to-[#203a10] rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Welcome back, {adminUser?.email?.split('@')[0] || 'Admin'}</h1>
          <p className="text-gray-200 text-sm mt-1.5 font-medium">Here is your paint store dashboard summary and quick indicators.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/dashboard/services-manager"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition whitespace-nowrap"
          >
            + Add Service
          </Link>
          <Link
            href="/admin/dashboard/inventory"
            className="px-4 py-2 bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 rounded-lg text-xs font-bold transition whitespace-nowrap"
          >
            Upload Inventory
          </Link>
          <Link
            href="/admin/dashboard/bookings"
            className="px-4 py-2 bg-white text-[#2D5016] hover:bg-gray-100 rounded-lg text-xs font-bold transition whitespace-nowrap"
          >
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Bookings Card (Blue) */}
        <Link 
          href="/admin/dashboard/bookings"
          className="bg-white hover:bg-blue-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition group block cursor-pointer"
        >
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-blue-500 transition">Total Bookings</h2>
          <p className="text-4xl font-extrabold text-blue-600 mt-2">{stats.totalBookings}</p>
          <p className="text-xs text-gray-500 mt-3 font-medium">Click to view all bookings &rarr;</p>
        </Link>

        {/* Pending Bookings Card (Yellow/Orange) */}
        <Link 
          href="/admin/dashboard/bookings?status=pending"
          className="bg-white hover:bg-amber-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition group block cursor-pointer"
        >
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-amber-500 transition">Pending Bookings</h2>
          <p className="text-4xl font-extrabold text-amber-600 mt-2">{stats.pendingBookings}</p>
          <p className="text-xs text-gray-500 mt-3 font-medium">Filter by pending estimates &rarr;</p>
        </Link>

        {/* Completed Bookings Card (Green) */}
        <Link 
          href="/admin/dashboard/bookings?status=completed"
          className="bg-white hover:bg-emerald-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition group block cursor-pointer"
        >
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-500 transition">Completed Bookings</h2>
          <p className="text-4xl font-extrabold text-emerald-600 mt-2">{stats.completedBookings}</p>
          <p className="text-xs text-gray-500 mt-3 font-medium">Filter by completed jobs &rarr;</p>
        </Link>

        {/* Unread Messages Card (Purple) */}
        <Link 
          href="/admin/dashboard/messages"
          className="bg-white hover:bg-purple-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition group block cursor-pointer"
        >
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-purple-500 transition">New Messages</h2>
          <p className="text-4xl font-extrabold text-purple-600 mt-2">{stats.unreadMessages}</p>
          <p className="text-xs text-gray-500 mt-3 font-medium">Respond to unread inquiries &rarr;</p>
        </Link>

        {/* Total Services Card (Blue) */}
        <Link 
          href="/admin/dashboard/services-manager"
          className="bg-white hover:bg-sky-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition group block cursor-pointer"
        >
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-sky-500 transition">Total Services</h2>
          <p className="text-4xl font-extrabold text-sky-600 mt-2">{stats.totalServices}</p>
          <p className="text-xs text-gray-500 mt-3 font-medium">Manage painting packages &rarr;</p>
        </Link>

        {/* Total Gallery Items Card (Green) */}
        <Link 
          href="/admin/dashboard/gallery-manager"
          className="bg-white hover:bg-teal-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition group block cursor-pointer"
        >
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-teal-500 transition">Gallery Showcase</h2>
          <p className="text-4xl font-extrabold text-teal-600 mt-2">{stats.totalGallery}</p>
          <p className="text-xs text-gray-500 mt-3 font-medium">Manage portfolio display &rarr;</p>
        </Link>
      </div>

      {/* Recent Activity (Last 5 Bookings) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
          <span>Recent Activity</span>
          <Link href="/admin/dashboard/bookings" className="text-sm font-bold text-[#2D5016] hover:underline">View All Bookings &rarr;</Link>
        </h2>

        {recentBookings.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No recent bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead className="text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Booking Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-700">{booking.customerName}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{booking.serviceType}</td>
                    <td className="px-4 py-3 text-gray-400 font-medium">{booking.bookingDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
