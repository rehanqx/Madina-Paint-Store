'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, writeBatch, query, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | string;
  archived?: boolean;
  replyText?: string;
  createdAt: any;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, unread, replied, archived
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Details Modal
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isMutating, setIsMutating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch contact messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(messagesData);
    } catch (err) {
      console.error('Error fetching messages:', err);
      showToast('Failed to load inbox messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Filter Messages
  useEffect(() => {
    let result = [...messages];

    // Filter by Search Term
    if (searchTerm.trim()) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Status / Archive state
    if (statusFilter === 'archived') {
      result = result.filter((m) => m.archived === true);
    } else {
      // By default, exclude archived messages from active views
      result = result.filter((m) => !m.archived);

      if (statusFilter === 'unread') {
        result = result.filter((m) => m.status === 'unread');
      } else if (statusFilter === 'replied') {
        result = result.filter((m) => m.status === 'replied');
      } else if (statusFilter === 'read') {
        result = result.filter((m) => m.status === 'read');
      }
    }

    setFilteredMessages(result);
    setSelectedIds([]); // clear selection on filter changes
  }, [messages, searchTerm, statusFilter]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Metrics
  const totalCount = messages.filter((m) => !m.archived).length;
  const unreadCount = messages.filter((m) => m.status === 'unread' && !m.archived).length;
  const repliedCount = messages.filter((m) => m.status === 'replied' && !m.archived).length;

  // Selection toggles
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredMessages.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  // Trigger Open Message
  const handleOpenMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    setReplyText(msg.replyText || '');

    // Mark as read if unread
    if (msg.status === 'unread') {
      try {
        const docRef = doc(db, 'messages', msg.id);
        await updateDoc(docRef, { status: 'read' });
        // Update local list state
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m))
        );
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  // Bulk Mark as Read
  const handleBulkMarkRead = async () => {
    if (selectedIds.length === 0) return;
    setIsMutating(true);
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        const docRef = doc(db, 'messages', id);
        batch.update(docRef, { status: 'read' });
      });
      await batch.commit();
      showToast(`Marked ${selectedIds.length} messages as read`, 'success');
      setSelectedIds([]);
      await fetchMessages();
    } catch (err) {
      showToast('Failed to bulk update messages', 'error');
    } finally {
      setIsMutating(true);
    }
  };

  // Bulk Archive
  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    setIsMutating(true);
    try {
      const batch = writeBatch(db);
      selectedIds.forEach((id) => {
        const docRef = doc(db, 'messages', id);
        batch.update(docRef, { archived: true });
      });
      await batch.commit();
      showToast(`Archived ${selectedIds.length} messages`, 'success');
      setSelectedIds([]);
      await fetchMessages();
    } catch (err) {
      showToast('Failed to bulk archive messages', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Send Reply Email & Update status
  const handleSendReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setIsMutating(true);
    try {
      // 1. Trigger SMTP Email Reply
      const emailRes = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_reply',
          to: selectedMessage.email,
          customerName: selectedMessage.name,
          originalMessage: selectedMessage.message,
          replyMessage: replyText,
        }),
      });

      const resJson = await emailRes.json();
      if (!emailRes.ok) {
        throw new Error(resJson.error || 'Failed to dispatch email reply.');
      }

      // 2. Save Reply to Firestore
      const docRef = doc(db, 'messages', selectedMessage.id);
      await updateDoc(docRef, {
        status: 'replied',
        replyText: replyText.trim(),
        repliedAt: new Date(),
      });

      showToast('Reply dispatched successfully!', 'success');
      setSelectedMessage(null);
      setReplyText('');
      await fetchMessages();
    } catch (err: any) {
      showToast(err.message || 'SMTP reply dispatch error', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Archive single message
  const handleArchiveSingle = async (id: string, archiveState: boolean) => {
    setIsMutating(true);
    try {
      const docRef = doc(db, 'messages', id);
      await updateDoc(docRef, { archived: archiveState });
      showToast(archiveState ? 'Message archived' : 'Message unarchived', 'success');
      setSelectedMessage(null);
      await fetchMessages();
    } catch (err) {
      showToast('Failed to update archive status', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Delete message
  const handleDeleteConfirm = async (id: string) => {
    setIsMutating(true);
    try {
      await deleteDoc(doc(db, 'messages', id));
      showToast('Message deleted successfully', 'success');
      setDeleteConfirmId(null);
      setSelectedMessage(null);
      await fetchMessages();
    } catch (err) {
      showToast('Failed to delete message', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Print Message
  const handlePrint = () => {
    window.print();
  };

  // Export filtered messages to Excel
  const handleExportMessages = () => {
    const data = filteredMessages.map((m) => ({
      'Message ID': m.id,
      'Name': m.name,
      'Email': m.email,
      'Phone': m.phone,
      'Message': m.message,
      'Status': m.status.toUpperCase(),
      'Archived': m.archived ? 'YES' : 'NO',
      'Date': m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleString() : 'N/A',
      'Admin Reply': m.replyText || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Messages');
    XLSX.writeFile(workbook, 'Contact_Messages_Inbox.xlsx');
    showToast('Inbox report exported successfully', 'success');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl printable-area">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white font-semibold z-50 transition-all transform duration-300 translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 no-print">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D5016]">Messages Inbox</h1>
          <p className="text-gray-500 text-sm mt-1">Review user submissions from the contact page form, send replies, and archive threads.</p>
        </div>
        <button
          onClick={handleExportMessages}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow transition cursor-pointer"
        >
          Export Report
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
        {/* Total active */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Messages</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalCount}</h3>
          </div>
          <span className="text-3xl bg-gray-100 p-3 rounded-full">✉️</span>
        </div>

        {/* Unread */}
        <div
          onClick={() => setStatusFilter('unread')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between cursor-pointer hover:border-red-400 transition"
        >
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Unread Messages</p>
            <h3 className={`text-3xl font-extrabold mt-2 ${unreadCount > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{unreadCount}</h3>
          </div>
          <span className={`text-3xl p-3 rounded-full ${unreadCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100'}`}>📬</span>
        </div>

        {/* Replied */}
        <div
          onClick={() => setStatusFilter('replied')}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between cursor-pointer hover:border-green-400 transition"
        >
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Replied Threads</p>
            <h3 className="text-3xl font-extrabold text-green-700 mt-2">{repliedCount}</h3>
          </div>
          <span className="text-3xl bg-green-50 p-3 rounded-full">📤</span>
        </div>
      </div>

      {/* Filters, Search & Bulk Actions toolbar */}
      <div className="space-y-4 mb-8 no-print">
        {/* Regular Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or email..."
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
              <option value="all">Active Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived Inbox</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#2D5016]/10 border border-[#2D5016]/25 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
            <span className="text-xs font-bold text-[#2D5016] uppercase tracking-wider">
              {selectedIds.length} Messages Selected
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleBulkMarkRead}
                className="flex-grow sm:flex-grow-0 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Mark as Read
              </button>
              <button
                onClick={handleBulkArchive}
                className="flex-grow sm:flex-grow-0 bg-[#2D5016] hover:bg-[#203a10] text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Archive Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages List Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016]"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
          <p className="text-gray-500 text-lg font-medium">No inbox messages match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredMessages.length && filteredMessages.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#2D5016] focus:ring-[#2D5016] cursor-pointer"
                    />
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sender</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Message Log Preview</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Submitted At</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.map((msg) => {
                  const isUnread = msg.status === 'unread';
                  return (
                    <tr
                      key={msg.id}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isUnread ? 'bg-[#2D5016]/5 font-bold' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(msg.id)}
                          onChange={(e) => handleSelectOne(msg.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#2D5016] focus:ring-[#2D5016] cursor-pointer"
                        />
                      </td>

                      {/* Status indicator */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold capitalize leading-none border ${
                          msg.status === 'unread'
                            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                            : msg.status === 'replied'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {msg.status}
                        </span>
                      </td>

                      {/* Sender */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{msg.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{msg.email}</div>
                      </td>

                      {/* Message Preview */}
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs font-normal">
                        {msg.message}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-400 font-medium">
                        {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => handleOpenMessage(msg)}
                          className="text-[#2D5016] hover:text-[#203a10] bg-[#2D5016]/10 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MESSAGE DETAIL MODAL ==================== */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm modal-container">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 print-modal">
            {/* Header */}
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center no-print">
              <div>
                <h2 className="text-lg font-bold text-[#2D5016]">Contact Message details</h2>
                <p className="text-xs text-gray-400 mt-0.5">Inbox Thread ID: {selectedMessage.id}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Print Header */}
            <div className="hidden print-header p-6 border-b text-center">
              <h1 className="text-2xl font-extrabold text-[#2D5016]">Madina Paint Store</h1>
              <p className="text-sm text-gray-500 mt-1">Customer Inquiry Record Sheet</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Sender Name</h4>
                  <p className="text-gray-900 font-bold mt-0.5">{selectedMessage.name}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone</h4>
                  <p className="text-gray-900 font-bold mt-0.5">{selectedMessage.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Address</h4>
                  <p className="text-gray-900 font-medium mt-0.5">{selectedMessage.email}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Received Time</h4>
                  <p className="text-gray-500 mt-0.5 text-xs font-bold">
                    {selectedMessage.createdAt ? new Date(selectedMessage.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Message Body */}
              <div className="bg-gray-50 p-4 border border-gray-150 rounded-xl">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Message Body</h4>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap italic">
                  "{selectedMessage.message}"
                </p>
              </div>

              {/* Print View Admin Response */}
              {selectedMessage.replyText && (
                <div className="hidden print-notes">
                  <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Admin Response Sent</h4>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap border p-3 rounded bg-green-50/50 mt-1">
                    {selectedMessage.replyText}
                  </p>
                </div>
              )}

              {/* Response reply text box (if not replied yet) */}
              {selectedMessage.status !== 'replied' ? (
                <form onSubmit={handleSendReplySubmit} className="space-y-4 pt-4 border-t border-gray-100 no-print">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Compose Response Email</label>
                    <textarea
                      placeholder="Write your email reply to the customer here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isMutating || !replyText.trim()}
                    className="w-full bg-[#2D5016] hover:bg-[#203a10] text-white py-2 rounded-lg font-bold text-xs shadow cursor-pointer text-center disabled:bg-gray-400"
                  >
                    {isMutating ? 'Sending Reply Email...' : 'Send Reply Email'}
                  </button>
                </form>
              ) : (
                /* Response preview (if already replied) */
                <div className="bg-green-50 border border-green-150 rounded-xl p-4 space-y-2 no-print">
                  <h4 className="text-green-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <span>✓</span> Admin Response Sent
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-white border border-green-100 p-3 rounded-lg">
                    {selectedMessage.replyText}
                  </p>
                </div>
              )}

              {/* Utility actions (archive, print, delete) */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 no-print">
                {/* Archive toggle */}
                {selectedMessage.archived ? (
                  <button
                    type="button"
                    onClick={() => handleArchiveSingle(selectedMessage.id, false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 py-2 rounded-lg font-bold text-xs cursor-pointer text-center"
                  >
                    Unarchive
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleArchiveSingle(selectedMessage.id, true)}
                    className="bg-[#2D5016]/10 hover:bg-[#2D5016]/15 text-[#2D5016] py-2 rounded-lg font-bold text-xs cursor-pointer text-center"
                  >
                    Archive Thread
                  </button>
                )}

                {/* Print */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 py-2 rounded-lg font-bold text-xs cursor-pointer text-center"
                >
                  Print Message
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedMessage.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold text-xs cursor-pointer text-center"
                >
                  Delete Message
                </button>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100 no-print">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-sm font-bold cursor-pointer"
                >
                  Close Detail Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/75 z-55 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Are you sure you want to permanently delete this customer message thread? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                disabled={isMutating}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold shadow-md cursor-pointer disabled:bg-gray-400"
              >
                {isMutating ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
