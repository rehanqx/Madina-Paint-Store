'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: any;
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsRef = collection(db, 'admin_logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const logsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          adminEmail: data.adminEmail || 'system@madinapaintstore.com',
          action: data.action || 'UNKNOWN',
          details: data.details || '',
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        };
      }) as ActivityLog[];
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (err) {
      console.error('Error fetching admin logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let result = [...logs];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.adminEmail.toLowerCase().includes(term) ||
          log.details.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term)
      );
    }

    // Filter by action category
    if (actionFilter !== 'all') {
      result = result.filter((log) => log.action === actionFilter);
    }

    setFilteredLogs(result);
  }, [logs, searchTerm, actionFilter]);

  // Extract unique actions for filters
  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2D5016]">System Activity Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Audit trail monitoring administrative actions and updates.</p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 border border-gray-300 hover:border-[#2D5016] text-gray-700 hover:text-[#2D5016] rounded-lg font-bold text-sm transition cursor-pointer"
        >
          Refresh Logs
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Search Logs</label>
          <input
            type="text"
            placeholder="Search by admin email, details, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Action Category</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5016]"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <span className="text-4xl">📋</span>
          <p className="text-gray-500 font-medium mt-3">No activity logs found matching filter criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin Email</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-medium">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700">
                    {log.adminEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-[#2D5016]/10 text-[#2D5016] px-2.5 py-1 rounded-full text-xs font-bold uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
