'use client';

import { ProtectedAdminRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, adminUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/bookings', label: 'Bookings' },
    { href: '/dashboard/inventory', label: 'Inventory' },
    { href: '/dashboard/gallery-manager', label: 'Gallery' },
    { href: '/dashboard/services-manager', label: 'Services' },
    { href: '/dashboard/messages', label: 'Messages' },
    { href: '/dashboard/activity-logs', label: 'Activity Logs' },
  ];

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-xl font-bold text-[#2D5016]">
                  Madina <span className="text-[#E8B44D]">Paint</span> Admin
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">{adminUser?.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
          {/* Sidebar Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm scrollbar-none">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-[#2D5016] text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-[#2D5016]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
