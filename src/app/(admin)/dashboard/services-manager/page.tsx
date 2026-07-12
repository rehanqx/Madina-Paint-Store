'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';

interface Service {
  id: string;
  name: string;
  description: string;
  pricing: number;
  image_urls: string[];
  category: string;
  order: number;
}

export default function AdminServicesManagerPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order-asc');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bookingWarningCount, setBookingWarningCount] = useState<number | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'interior',
    pricing: 0,
    order: 1,
  });

  // Nested Multi-Image URL list state
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUrlList, setImageUrlList] = useState<string[]>([]);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // Fetch Services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const servicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(servicesData);
    } catch (err) {
      console.error('Error fetching services:', err);
      showToast('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter & Sort
  useEffect(() => {
    let result = [...services];

    if (searchTerm.trim()) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((s) => s.category === categoryFilter);
    }

    if (sortBy === 'order-asc') {
      result.sort((a, b) => a.order - b.order);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.pricing - b.pricing);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.pricing - a.pricing);
    }

    setFilteredServices(result);
  }, [services, searchTerm, categoryFilter, sortBy]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Add new Image URL to local list
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImageUrlList((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Remove Image URL from local list
  const handleRemoveImageUrl = (index: number) => {
    setImageUrlList((prev) => prev.filter((_, i) => i !== index));
  };

  // Move Image URL Left / Right (reorder inside modal)
  const handleShiftImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imageUrlList.length) return;

    const listCopy = [...imageUrlList];
    const temp = listCopy[index];
    listCopy[index] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;
    setImageUrlList(listCopy);
  };

  // Add Service Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.pricing <= 0) {
      showToast('Name and pricing are required', 'error');
      return;
    }

    setIsMutating(true);
    try {
      await addDoc(collection(db, 'services'), {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        pricing: Number(formData.pricing),
        image_urls: imageUrlList,
        order: Number(formData.order),
        createdAt: new Date(),
      });

      showToast('Service created successfully', 'success');
      setShowAddModal(false);
      setFormData({ name: '', description: '', category: 'interior', pricing: 0, order: services.length + 1 });
      setImageUrlList([]);
      await fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to create service', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Trigger Edit Modal
  const triggerEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      pricing: service.pricing,
      order: service.order,
    });
    setImageUrlList(service.image_urls || []);
    setShowEditModal(true);
  };

  // Edit Service Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'services', selectedService.id), {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        pricing: Number(formData.pricing),
        image_urls: imageUrlList,
        order: Number(formData.order),
      });

      showToast('Service updated successfully', 'success');
      setShowEditModal(false);
      setSelectedService(null);
      setImageUrlList([]);
      await fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to update service', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Trigger Delete confirmation with booking query
  const triggerDelete = async (service: Service) => {
    setIsMutating(true);
    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('serviceType', '==', service.name));
      const snapshot = await getDocs(q);
      setBookingWarningCount(snapshot.size > 0 ? snapshot.size : null);
      setDeleteConfirmId(service.id);
    } catch (err) {
      console.error(err);
      setDeleteConfirmId(service.id);
    } finally {
      setIsMutating(false);
    }
  };

  // Delete Service Confirm
  const handleDeleteConfirm = async (id: string) => {
    setIsMutating(true);
    try {
      await deleteDoc(doc(db, 'services', id));
      showToast('Service deleted successfully', 'success');
      setDeleteConfirmId(null);
      setBookingWarningCount(null);
      setShowEditModal(false);
      await fetchServices();
    } catch (err: any) {
      showToast('Failed to delete service', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Move service row up / down
  const handleMoveService = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredServices.length) return;

    setIsMutating(true);
    try {
      const itemA = filteredServices[index];
      const itemB = filteredServices[targetIndex];

      const tempOrder = itemA.order;
      itemA.order = itemB.order;
      itemB.order = tempOrder;

      await updateDoc(doc(db, 'services', itemA.id), { order: itemA.order });
      await updateDoc(doc(db, 'services', itemB.id), { order: itemB.order });

      showToast('Position updated', 'success');
      await fetchServices();
    } catch (err) {
      showToast('Failed to reorder services', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  // Drop reorder logic
  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    setIsMutating(true);
    try {
      const newList = [...filteredServices];
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, draggedItem);

      // Re-assign sequence orders starting from 1
      const updatedList = newList.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      // Commit changes to Firestore
      const updatePromises = updatedList.map((item) => {
        const originalItem = services.find((o) => o.id === item.id);
        if (originalItem && originalItem.order !== item.order) {
          return updateDoc(doc(db, 'services', item.id), { order: item.order });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      showToast('Sequence reordered successfully!', 'success');
      await fetchServices();
    } catch (err) {
      showToast('Failed to save drag-drop order', 'error');
    } finally {
      setDraggedIndex(null);
      setIsMutating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Toast banners */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white font-semibold z-50 transition-all transform duration-300 translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D5016]">Services Catalog Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Configure customer paint packages, prices, category tags, and edit photo decks.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', description: '', category: 'interior', pricing: 0, order: services.length + 1 });
            setImageUrlList([]);
            setShowAddModal(true);
          }}
          className="bg-[#2D5016] hover:bg-[#203a10] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow transition cursor-pointer"
        >
          + Add New Service
        </button>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between mb-8 max-w-xs">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Services</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{services.length}</h3>
        </div>
        <span className="text-3xl bg-gray-100 p-3 rounded-full">🛠️</span>
      </div>

      {/* Filters and Sorting bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search service name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition w-full sm:w-64"
          />

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition w-full sm:w-48"
          >
            <option value="all">All Categories</option>
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
            <option value="commercial">Commercial</option>
            <option value="residential">Residential</option>
          </select>
        </div>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition w-full md:w-48"
        >
          <option value="order-asc">Sort by Order (Asc)</option>
          <option value="name-asc">Sort by Name (A-Z)</option>
          <option value="price-asc">Sort by Price (Low to High)</option>
          <option value="price-desc">Sort by Price (High to Low)</option>
        </select>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016]"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
          <p className="text-gray-500 text-lg font-medium">No painting services found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">Drag</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Image</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Category</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Starting Price</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Order</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Swap</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service, index) => (
                  <tr
                    key={service.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`transition-colors hover:bg-gray-50/80 cursor-grab active:cursor-grabbing ${
                      draggedIndex === index ? 'opacity-40 bg-[#2D5016]/5 border-2 border-dashed border-[#2D5016]' : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <td className="px-6 py-4 text-center text-gray-400 font-bold select-none cursor-grab">☰</td>

                    {/* Image Preview on hover */}
                    <td className="px-6 py-4 relative group">
                      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                        <img
                          src={service.image_urls?.[0]}
                          alt={service.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"%3E%3Crect fill="%23e5e7eb" width="100" height="75"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      {/* Zoom card on hover */}
                      <div className="hidden group-hover:block absolute left-24 top-1/2 -translate-y-1/2 w-48 h-36 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden p-1 z-30 transition-all">
                        <img
                          src={service.image_urls?.[0]}
                          alt={service.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </td>

                    {/* Service Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 truncate max-w-xs">{service.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{service.description}</div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-bold rounded-full capitalize bg-gray-100 text-gray-800">
                        {service.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                      Rs. {service.pricing.toLocaleString()}
                    </td>

                    {/* Order */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-800">
                      {service.order}
                    </td>

                    {/* Row swappers Up/Down */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-1 select-none">
                        <button
                          type="button"
                          onClick={() => handleMoveService(index, 'up')}
                          disabled={index === 0 || isMutating}
                          className="px-2 py-1 text-gray-600 hover:text-[#2D5016] disabled:text-gray-200 transition rounded hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed font-bold"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveService(index, 'down')}
                          disabled={index === filteredServices.length - 1 || isMutating}
                          className="px-2 py-1 text-gray-600 hover:text-[#2D5016] disabled:text-gray-200 transition rounded hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed font-bold"
                        >
                          ▼
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => triggerEdit(service)}
                          className="text-[#2D5016] hover:text-[#203a10] bg-[#2D5016]/10 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== ADD SERVICE FORM MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2D5016]">Add Painting Service</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Interior Coat"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                >
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                </select>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Starting Price (Rs) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Starting estimate price"
                  value={formData.pricing}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sequence Order *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  placeholder="Describe details, double coats, priming parameters..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
              </div>

              {/* Nested Image URL List Widget */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Image Album URLs</h4>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-grow px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-[#2D5016] hover:bg-[#203a10] text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Previews List */}
                {imageUrlList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No image URLs added yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pt-2">
                    {imageUrlList.map((url, idx) => (
                      <div key={idx} className="relative group/image border border-gray-200 rounded-lg overflow-hidden bg-white p-1 flex flex-col justify-between">
                        <img
                          src={url}
                          alt={`Service pic ${idx + 1}`}
                          className="w-full h-16 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                          }}
                        />
                        <div className="flex justify-between items-center mt-1">
                          {/* Image Shift controls */}
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleShiftImage(idx, 'left')}
                              disabled={idx === 0}
                              className="text-[9px] font-bold px-1 text-gray-500 hover:text-[#2D5016] disabled:text-gray-200 cursor-pointer"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShiftImage(idx, 'right')}
                              disabled={idx === imageUrlList.length - 1}
                              className="text-[9px] font-bold px-1 text-gray-500 hover:text-[#2D5016] disabled:text-gray-200 cursor-pointer"
                            >
                              ▶
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-0.5 cursor-pointer rounded hover:bg-red-50"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-5 py-2 rounded-lg bg-[#2D5016] hover:bg-[#203a10] text-white text-sm font-bold shadow transition cursor-pointer disabled:bg-gray-400"
                >
                  {isMutating ? 'Saving...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT SERVICE FORM MODAL ==================== */}
      {showEditModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2D5016]">Edit Service Details</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedService(null);
                }}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Interior Coat"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                >
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                </select>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Starting Price (Rs) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Starting estimate price"
                  value={formData.pricing}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sequence Order *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  placeholder="Describe details, double coats, priming parameters..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
              </div>

              {/* Nested Image URL List Widget */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Image Album URLs</h4>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-grow px-3 py-1.5 border border-gray-300 bg-white rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-[#2D5016] hover:bg-[#203a10] text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Previews List */}
                {imageUrlList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No image URLs added yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pt-2">
                    {imageUrlList.map((url, idx) => (
                      <div key={idx} className="relative group/image border border-gray-200 rounded-lg overflow-hidden bg-white p-1 flex flex-col justify-between">
                        <img
                          src={url}
                          alt={`Service pic ${idx + 1}`}
                          className="w-full h-16 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                          }}
                        />
                        <div className="flex justify-between items-center mt-1">
                          {/* Image Shift controls */}
                          <div className="flex gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleShiftImage(idx, 'left')}
                              disabled={idx === 0}
                              className="text-[9px] font-bold px-1 text-gray-500 hover:text-[#2D5016] disabled:text-gray-200 cursor-pointer"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShiftImage(idx, 'right')}
                              disabled={idx === imageUrlList.length - 1}
                              className="text-[9px] font-bold px-1 text-gray-500 hover:text-[#2D5016] disabled:text-gray-200 cursor-pointer"
                            >
                              ▶
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImageUrl(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-0.5 cursor-pointer rounded hover:bg-red-50"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => triggerDelete(selectedService)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold cursor-pointer"
                >
                  Delete Service
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedService(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="px-5 py-2 rounded-lg bg-[#2D5016] hover:bg-[#203a10] text-white text-sm font-bold shadow transition cursor-pointer disabled:bg-gray-400"
                  >
                    {isMutating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION DIALOG ==================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/75 z-55 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
            
            {/* Warning block if service has bookings */}
            {bookingWarningCount !== null ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-3 text-left">
                <p className="text-amber-800 text-xs font-bold leading-normal">
                  ⚠️ WARNING: This service has {bookingWarningCount} active customer bookings. Deleting it will affect client references.
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                Are you sure you want to remove this painting service from the catalog? This action cannot be undone.
              </p>
            )}

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmId(null);
                  setBookingWarningCount(null);
                }}
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
