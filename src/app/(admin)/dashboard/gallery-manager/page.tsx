'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { getFriendlyErrorMessage } from '@/lib/errorHandler';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  service_category: string;
  description: string;
  order: number;
}

export default function AdminGalleryManagerPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order-asc');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    service_category: 'interior',
    description: '',
    order: 1,
  });

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // Fetch items
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const galleryRef = collection(db, 'gallery');
      const q = query(galleryRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const galleryData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryItem[];
      setGallery(galleryData);
    } catch (err: any) {
      console.error('Error loading gallery:', err);
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...gallery];

    // Search Filter
    if (searchTerm.trim()) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.service_category === categoryFilter);
    }

    // Sorting
    if (sortBy === 'order-asc') {
      result.sort((a, b) => a.order - b.order);
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'order-desc') {
      result.sort((a, b) => b.order - a.order);
    }

    setFilteredItems(result);
  }, [gallery, searchTerm, categoryFilter, sortBy]);



  // Add Item Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) {
      toast.error('Title and Image URL are required');
      return;
    }
    setIsMutating(true);
    try {
      const galleryRef = collection(db, 'gallery');
      await addDoc(galleryRef, {
        title: formData.title,
        image_url: formData.image_url,
        service_category: formData.service_category,
        description: formData.description,
        order: Number(formData.order),
        createdAt: new Date(),
      });
      toast.success('Gallery item added successfully!');
      setShowAddModal(false);
      setFormData({
        title: '',
        image_url: '',
        service_category: 'interior',
        description: '',
        order: gallery.length + 1,
      });
      await fetchGallery();
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsMutating(false);
    }
  };

  // Edit Item Modal Trigger
  const triggerEdit = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      image_url: item.image_url,
      service_category: item.service_category,
      description: item.description || '',
      order: item.order,
    });
    setShowEditModal(true);
  };

  // Edit Item Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsMutating(true);
    try {
      const docRef = doc(db, 'gallery', selectedItem.id);
      await updateDoc(docRef, {
        title: formData.title,
        image_url: formData.image_url,
        service_category: formData.service_category,
        description: formData.description,
        order: Number(formData.order),
      });
      toast.success('Gallery item updated successfully!');
      setShowEditModal(false);
      setSelectedItem(null);
      await fetchGallery();
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsMutating(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: string) => {
    setIsMutating(true);
    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast.success('Item deleted successfully!');
      setDeleteConfirmId(null);
      setShowEditModal(false);
      await fetchGallery();
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setIsMutating(false);
    }
  };

  // Up / Down Button Swappers
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

    setIsMutating(true);
    try {
      const itemA = filteredItems[index];
      const itemB = filteredItems[targetIndex];

      const tempOrder = itemA.order;
      itemA.order = itemB.order;
      itemB.order = tempOrder;

      await updateDoc(doc(db, 'gallery', itemA.id), { order: itemA.order });
      await updateDoc(doc(db, 'gallery', itemB.id), { order: itemB.order });

      toast.success('Position updated!');
      await fetchGallery();
    } catch (err: any) {
      toast.error('Failed to swap positions');
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
      const newList = [...filteredItems];
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, draggedItem);

      // Map sequential order values
      const updatedList = newList.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      // Commit changes to Firestore
      const updatePromises = updatedList.map((item) => {
        const originalItem = gallery.find((o) => o.id === item.id);
        if (originalItem && originalItem.order !== item.order) {
          return updateDoc(doc(db, 'gallery', item.id), { order: item.order });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      toast.success('Sequence reordered successfully!');
      await fetchGallery();
    } catch (err) {
      toast.error('Failed to save drag-drop order');
    } finally {
      setDraggedIndex(null);
      setIsMutating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">


      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D5016]">Gallery Portfolio Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Manage project albums, filter listings, and change grid ordering sequences.</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              title: '',
              image_url: '',
              service_category: 'interior',
              description: '',
              order: gallery.length + 1,
            });
            setShowAddModal(true);
          }}
          className="bg-[#2D5016] hover:bg-[#203a10] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md transition cursor-pointer self-start sm:self-center"
        >
          + Add New Project
        </button>
      </div>

      {/* Filters and Sorting Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition w-full sm:w-64"
          />
          {/* Category Dropdown */}
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
          <option value="order-desc">Sort by Order (Desc)</option>
          <option value="title-asc">Sort by Title (A-Z)</option>
        </select>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016]"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
          <p className="text-gray-500 text-lg font-medium">No portfolio items found matching your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10">Drag</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Image</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Project Title</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Category</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Sequence</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Reorder</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`transition-colors duration-150 group/row hover:bg-gray-50/80 cursor-grab active:cursor-grabbing ${
                      draggedIndex === index ? 'opacity-40 bg-[#2D5016]/5 border-2 border-dashed border-[#2D5016]' : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <td className="px-6 py-4 text-center text-gray-400 font-bold select-none cursor-grab">
                      ☰
                    </td>

                    {/* Image thumbnail hover zoom */}
                    <td className="px-6 py-4 relative group">
                      <div className="relative w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 75"%3E%3Crect fill="%23e5e7eb" width="100" height="75"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                      {/* Popover zoom */}
                      <div className="hidden group-hover:block absolute left-24 top-1/2 -translate-y-1/2 w-48 h-36 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-30 transition-all p-1">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 truncate max-w-xs">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{item.description}</div>
                      )}
                    </td>

                    {/* Category Tag */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-bold rounded-full capitalize bg-gray-100 text-gray-800">
                        {item.service_category}
                      </span>
                    </td>

                    {/* Order Sequence */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                      {item.order}
                    </td>

                    {/* Reorder controls (up/down arrow) */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0 || isMutating}
                          className="px-2 py-1 text-gray-600 hover:text-[#2D5016] disabled:text-gray-200 transition rounded hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed font-bold"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === filteredItems.length - 1 || isMutating}
                          className="px-2 py-1 text-gray-600 hover:text-[#2D5016] disabled:text-gray-200 transition rounded hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed font-bold"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                    </td>

                    {/* Edit / Delete Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => triggerEdit(item)}
                          disabled={isMutating}
                          className="text-[#2D5016] hover:text-[#203a10] bg-[#2D5016]/10 hover:bg-[#2D5016]/20 px-3 py-1.5 rounded-lg transition text-xs font-bold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          disabled={isMutating}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition text-xs font-bold cursor-pointer"
                        >
                          Delete
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

      {/* ==================== ADD ITEM MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2D5016]">Add New Portfolio Project</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Living Room Paint Finish"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Category *</label>
                <select
                  value={formData.service_category}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                >
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                </select>
              </div>

              {/* Sequence Order */}
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
                  placeholder="Detailed project summary..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
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
                  className="px-5 py-2 rounded-lg bg-[#2D5016] hover:bg-[#203a10] text-white text-sm font-bold shadow-md cursor-pointer disabled:bg-gray-400"
                >
                  {isMutating ? 'Adding...' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT ITEM MODAL ==================== */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2D5016]">Edit Portfolio Project</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                }}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Living Room Paint Finish"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Category *</label>
                <select
                  value={formData.service_category}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                >
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                </select>
              </div>

              {/* Sequence Order */}
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
                  placeholder="Detailed project summary..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedItem.id)}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold cursor-pointer"
                >
                  Delete Item
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="px-5 py-2 rounded-lg bg-[#2D5016] hover:bg-[#203a10] text-white text-sm font-bold shadow-md cursor-pointer disabled:bg-gray-400"
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
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Are you sure you want to remove this project from your gallery showcase? This action cannot be undone.
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
                onClick={() => handleDelete(deleteConfirmId)}
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
