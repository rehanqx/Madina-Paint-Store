'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { getFriendlyErrorMessage } from '@/lib/errorHandler';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { logAdminAction } from '@/lib/activityLog';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
  notes?: string;
  createdAt: any;
}

export default function AdminBookingsPage() {
  const { adminUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Filters & Views
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentView, setCurrentView] = useState<'table' | 'calendar'>('table');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Selected Booking & Notes State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [notes, setNotes] = useState('');
  const [isMutating, setIsMutating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('bookingDate', 'desc'));
      const snapshot = await getDocs(q);
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter Bookings
  useEffect(() => {
    let result = [...bookings];

    if (searchTerm.trim()) {
      result = result.filter(
        (b) =>
          b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(result);
  }, [bookings, searchTerm, statusFilter]);



  // Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  // Send Status Email (invokes api/email server route)
  const sendStatusEmail = async (booking: Booking, status: string, statusNotes: string) => {
    try {
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: booking.email,
          customerName: booking.customerName,
          serviceType: booking.serviceType,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          status,
          notes: statusNotes,
        }),
      });
    } catch (err) {
      console.error('Failed to trigger notification email:', err);
    }
  };

  // Update Booking Status
  const handleUpdateStatus = async (bookingId: string, status: string, statusNotes: string) => {
    if (!selectedBooking) return;
    setIsMutating(true);
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, { status, notes: statusNotes, updatedAt: new Date() });
      await logAdminAction(adminUser?.email, 'UPDATE_BOOKING', `Changed booking status to ${status} for ${selectedBooking?.customerName || bookingId}`);
      toast.success(`Booking marked as ${status}!`);

      // Trigger server email notification
      await sendStatusEmail(selectedBooking, status, statusNotes);

      // Close modals
      setSelectedBooking(null);
      setShowCancelPrompt(false);
      setCancelReason('');
      await fetchBookings();
    } catch (err) {
      toast.error('Failed to update booking status');
    } finally {
      setIsMutating(false);
    }
  };

  // SheetJS Export
  const handleExportBookings = () => {
    const data = filteredBookings.map((b) => ({
      'Booking ID': b.id,
      'Customer Name': b.customerName,
      'Phone': b.phone,
      'Email': b.email,
      'Service Type': b.serviceType,
      'Date': b.bookingDate,
      'Time Slot': b.bookingTime,
      'Status': b.status.toUpperCase(),
      'Address': b.address,
      'Notes': b.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, 'Madina_Paint_Shop_Bookings.xlsx');
    toast.success('Bookings report exported successfully');
  };

  // WhatsApp Link Helper
  const getWhatsAppLink = (booking: Booking) => {
    const message = `Hi ${booking.customerName}! This is Madina Paint Store confirming your booking for ${booking.serviceType} scheduled on ${booking.bookingDate} at ${booking.bookingTime}.`;
    return `https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  };

  // print document
  const handlePrint = () => {
    window.print();
  };

  // Calendar Math
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleSelectBooking = (b: Booking) => {
    setSelectedBooking(b);
    setNotes(b.notes || '');
  };

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const cells = [];

    // Padding cells for start of month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`pad-${i}`} className="bg-gray-50 h-28 border border-gray-100 p-2"></div>);
    }

    // Days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = bookings.filter((b) => b.bookingDate === dateString);

      cells.push(
        <div key={day} className="bg-white h-28 border border-gray-100 p-2 flex flex-col justify-between hover:bg-gray-50 transition-colors">
          <span className="text-sm font-bold text-gray-700">{day}</span>
          <div className="space-y-1 overflow-y-auto max-h-20">
            {dayBookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                onClick={() => handleSelectBooking(b)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded truncate cursor-pointer ${
                  b.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : b.status === 'confirmed'
                    ? 'bg-blue-100 text-blue-800'
                    : b.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
                title={b.customerName}
              >
                {b.customerName}
              </div>
            ))}
            {dayBookings.length > 3 && (
              <div className="text-[9px] text-gray-400 text-center font-bold">
                + {dayBookings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl printable-area">


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D5016]">Customer Bookings Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Review scheduled painter appointments, change status, and send update emails.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportBookings}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow transition cursor-pointer"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
        {/* Total Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">All-Time Bookings</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalCount}</h3>
          </div>
          <span className="text-3xl bg-gray-100 p-3 rounded-full">📅</span>
        </div>

        {/* Pending */}
        <div
          onClick={() => setStatusFilter('pending')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between cursor-pointer hover:border-amber-400 transition"
        >
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-3xl font-extrabold text-amber-600 mt-2">{pendingCount}</h3>
          </div>
          <span className="text-3xl bg-amber-50 p-3 rounded-full">⌛</span>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter('completed')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between cursor-pointer hover:border-green-400 transition"
        >
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Completed Jobs</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-2">{completedCount}</h3>
          </div>
          <span className="text-3xl bg-green-50 p-3 rounded-full">✓</span>
        </div>
      </div>

      {/* Filters and View Toggles */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition w-full sm:w-64"
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-full md:w-auto">
          <button
            onClick={() => setCurrentView('table')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              currentView === 'table' ? 'bg-white text-[#2D5016] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Table view
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              currentView === 'calendar' ? 'bg-white text-[#2D5016] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendar view
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {currentView === 'table' ? (
        /* Table View */
        loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016]"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
            <p className="text-gray-500 text-lg font-medium">No bookings match your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden no-print">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Date</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Time Slot</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Status</th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400 uppercase">{b.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{b.customerName}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{b.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">{b.serviceType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">{b.bookingDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-medium">{b.bookingTime}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize leading-none border ${
                          b.status === 'pending'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : b.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : b.status === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => handleSelectBooking(b)}
                          className="text-[#2D5016] hover:text-[#203a10] bg-[#2D5016]/10 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Calendar view */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 no-print">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                className="p-1 px-3 border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold transition cursor-pointer"
              >
                ◀
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="p-1 px-3 border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                className="p-1 px-3 border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold transition cursor-pointer"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
            {/* Week Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-gray-50 py-2 text-center text-xs font-bold text-gray-500">{d}</div>
            ))}
            {/* Days */}
            {renderCalendarDays()}
          </div>
        </div>
      )}

      {/* ==================== DETAILS MODAL ==================== */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm modal-container">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 print-modal">
            {/* Header */}
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center no-print">
              <div>
                <h2 className="text-lg font-bold text-[#2D5016]">Booking Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">ID: {selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Print Header */}
            <div className="hidden print-header p-6 border-b text-center">
              <h1 className="text-2xl font-extrabold text-[#2D5016]">Madina Paint Store</h1>
              <p className="text-sm text-gray-500 mt-1">Consultation Service Appointment Voucher</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Customer summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Customer Name</h4>
                  <p className="text-gray-900 font-bold mt-0.5">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone</h4>
                  <p className="text-gray-900 font-bold mt-0.5">{selectedBooking.phone}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Address</h4>
                  <p className="text-gray-900 font-medium mt-0.5">{selectedBooking.email}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Site Address</h4>
                  <p className="text-gray-900 mt-0.5 leading-relaxed">{selectedBooking.address || 'N/A'}</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Service Type</h4>
                  <p className="text-gray-900 font-bold mt-0.5">{selectedBooking.serviceType}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Status</h4>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border mt-1 capitalize ${
                    selectedBooking.status === 'pending'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : selectedBooking.status === 'confirmed'
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : selectedBooking.status === 'completed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Preferred Date</h4>
                  <p className="text-gray-900 font-bold mt-0.5">{selectedBooking.bookingDate}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Time Slot</h4>
                  <p className="text-gray-900 font-bold mt-0.5">{selectedBooking.bookingTime}</p>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="no-print">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Internal Shop Notes</label>
                <textarea
                  placeholder="Add color matching spectrometer codes, paint brand preferences, custom sizes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
              </div>

              {/* Print View Notes */}
              <div className="hidden print-notes">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Internal Shop Notes</h4>
                <p className="text-gray-800 text-sm italic mt-1 leading-relaxed border p-3 rounded bg-gray-50">
                  {notes || 'No internal notes registered.'}
                </p>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-4 border-t border-gray-100 no-print">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Update Actions</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Confirm Booking */}
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed', notes)}
                      disabled={isMutating}
                      className="bg-[#2D5016] hover:bg-[#203a10] text-white py-2 rounded-lg font-bold text-xs shadow cursor-pointer text-center"
                    >
                      Confirm Booking
                    </button>
                  )}

                  {/* Mark as Complete */}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'completed', notes)}
                      disabled={isMutating}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold text-xs shadow cursor-pointer text-center"
                    >
                      Mark as Complete
                    </button>
                  )}

                  {/* Cancel Booking Trigger */}
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                    <button
                      onClick={() => setShowCancelPrompt(true)}
                      disabled={isMutating}
                      className="bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs cursor-pointer text-center"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {/* Print */}
                  <button
                    onClick={handlePrint}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 py-2 rounded-lg font-bold text-xs cursor-pointer text-center"
                  >
                    Print Details
                  </button>

                  {/* WhatsApp */}
                  <a
                    href={getWhatsAppLink(selectedBooking)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-xs shadow text-center flex items-center justify-center cursor-pointer"
                  >
                    Send WhatsApp
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 no-print">
                <button
                  onClick={async () => {
                    // Update notes if changed
                    if (notes !== selectedBooking.notes) {
                      await updateDoc(doc(db, 'bookings', selectedBooking.id), { notes });
                      await logAdminAction(adminUser?.email, 'SAVE_BOOKING_NOTES', `Updated internal notes for booking of ${selectedBooking.customerName}`);
                      toast.success('Internal notes saved!');
                    }
                    setSelectedBooking(null);
                    fetchBookings();
                  }}
                  className="px-5 py-2.5 bg-[#2D5016] hover:bg-[#203a10] text-white rounded-lg text-sm font-bold shadow cursor-pointer"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CANCEL APPOINTMENT REASON PROMPT ==================== */}
      {showCancelPrompt && selectedBooking && (
        <div className="fixed inset-0 bg-black/75 z-55 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
            <p className="text-gray-400 text-xs mt-1">Please provide a reason for cancelling this appointment.</p>
            
            <div className="mt-4">
              <textarea
                placeholder="e.g. Requested time slot not available / Weather conditions..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowCancelPrompt(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-bold cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled', cancelReason)}
                disabled={!cancelReason.trim() || isMutating}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow cursor-pointer disabled:bg-gray-400"
              >
                {isMutating ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
