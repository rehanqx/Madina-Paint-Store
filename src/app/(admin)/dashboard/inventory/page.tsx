'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp, query, orderBy } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface InventoryItem {
  id: string;
  name: string;
  color: string;
  currentStock: number;
  soldCount: number;
  cost: number;
  supplier: string;
  updatedAt: any;
}

interface ExcelRow {
  'Product Name'?: string;
  'ProductName'?: string;
  'Product'?: string;
  'Color'?: string;
  'Opening Stock'?: number;
  'OpeningStock'?: number;
  'Sold'?: number;
  'Cost'?: number;
  'Supplier'?: string;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Manual CRUD Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Excel Upload States
  const [excelPreview, setExcelPreview] = useState<any[] | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    currentStock: 0,
    soldCount: 0,
    cost: 0,
    supplier: '',
  });

  // Fetch Inventory items
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(inventoryRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const inventoryData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
      setInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      showToast('Failed to load inventory items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Filter Inventory
  useEffect(() => {
    let result = [...inventory];

    if (searchTerm.trim()) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (lowStockFilter) {
      result = result.filter((item) => item.currentStock <= lowStockThreshold);
    }

    setFilteredInventory(result);
  }, [inventory, searchTerm, lowStockFilter, lowStockThreshold]);

  // Toast banner helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Metrics
  const totalProducts = inventory.length;
  const lowStockCount = inventory.filter((item) => item.currentStock <= lowStockThreshold).length;
  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock * item.cost, 0);

  // Add Product Manually
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.color || formData.cost <= 0) {
      showToast('Name, color, and positive cost are required', 'error');
      return;
    }

    setIsMutating(true);
    try {
      await addDoc(collection(db, 'inventory'), {
        name: formData.name,
        color: formData.color,
        currentStock: Number(formData.currentStock),
        soldCount: Number(formData.soldCount),
        cost: Number(formData.cost),
        supplier: formData.supplier || 'N/A',
        updatedAt: serverTimestamp(),
      });
      showToast('Product added successfully', 'success');
      setShowAddModal(false);
      setFormData({ name: '', color: '', currentStock: 0, soldCount: 0, cost: 0, supplier: '' });
      await fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to add product', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Trigger Edit modal
  const triggerEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      color: item.color,
      currentStock: item.currentStock,
      soldCount: item.soldCount,
      cost: item.cost,
      supplier: item.supplier || '',
    });
    setShowEditModal(true);
  };

  // Edit Product Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsMutating(true);
    try {
      await updateDoc(doc(db, 'inventory', selectedItem.id), {
        name: formData.name,
        color: formData.color,
        currentStock: Number(formData.currentStock),
        soldCount: Number(formData.soldCount),
        cost: Number(formData.cost),
        supplier: formData.supplier || 'N/A',
        updatedAt: serverTimestamp(),
      });
      showToast('Product updated successfully', 'success');
      setShowEditModal(false);
      setSelectedItem(null);
      await fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to update product', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Delete product
  const handleDelete = async (id: string) => {
    setIsMutating(true);
    try {
      await deleteDoc(doc(db, 'inventory', id));
      showToast('Product deleted successfully', 'success');
      setDeleteConfirmId(null);
      setShowEditModal(false);
      await fetchInventory();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Parse Excel File
  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

        // Validate and map rows
        const parsedRows = rows
          .map((row) => {
            const name = row['Product Name'] || row['ProductName'] || row['Product'];
            const color = row['Color'];
            const openingStock = Number(row['Opening Stock'] || row['OpeningStock'] || 0);
            const sold = Number(row['Sold'] || 0);
            const cost = Number(row['Cost'] || 0);
            const supplier = row['Supplier'] || 'N/A';

            return {
              name: name?.toString().trim() || '',
              color: color?.toString().trim() || '',
              currentStock: Math.max(0, openingStock - sold),
              soldCount: sold,
              cost: cost,
              supplier: supplier.toString().trim(),
            };
          })
          .filter((item) => item.name && item.color && item.cost >= 0);

        if (parsedRows.length === 0) {
          showToast('No valid inventory rows found in Excel sheet', 'error');
          return;
        }

        setExcelPreview(parsedRows);
      } catch (err) {
        showToast('Failed to parse Excel file', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Drag Over Dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle Drag Leave
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      parseExcelFile(file);
    } else {
      showToast('Please upload a valid Excel workbook file', 'error');
    }
  };

  // Handle File Input Change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseExcelFile(file);
    }
  };

  // Confirm Excel Batch Upload
  const handleConfirmExcelImport = async () => {
    if (!excelPreview || excelPreview.length === 0) return;

    setIsMutating(true);
    try {
      const batch = writeBatch(db);
      const inventoryRef = collection(db, 'inventory');

      excelPreview.forEach((row) => {
        const docRef = doc(inventoryRef);
        batch.set(docRef, {
          name: row.name,
          color: row.color,
          currentStock: row.currentStock,
          soldCount: row.soldCount,
          cost: row.cost,
          supplier: row.supplier,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      showToast(`Successfully imported ${excelPreview.length} items!`, 'success');
      setExcelPreview(null);
      await fetchInventory();
    } catch (err) {
      showToast('Failed to batch upload Excel data', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Export current inventory to Excel
  const handleExportExcel = () => {
    const data = inventory.map((item) => ({
      'Product Name': item.name,
      'Color': item.color,
      'Current Stock': item.currentStock,
      'Sold': item.soldCount,
      'Cost': item.cost,
      'Supplier': item.supplier,
      'Last Updated': item.updatedAt ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paint Inventory');
    XLSX.writeFile(workbook, 'Paint_Shop_Inventory.xlsx');
    showToast('Inventory exported successfully', 'success');
  };

  // Export Excel Template
  const handleDownloadTemplate = () => {
    const headers = [
      {
        'Product Name': 'Premium Emulsion',
        'Color': 'Cobalt Blue',
        'Opening Stock': 120,
        'Sold': 15,
        'Cost': 1500,
        'Supplier': 'Berger Paints',
      },
      {
        'Product Name': 'Weather Coat Matt',
        'Color': 'Creamy Beige',
        'Opening Stock': 80,
        'Sold': 5,
        'Cost': 1800,
        'Supplier': 'Dulux',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'Inventory_Import_Template.xlsx');
    showToast('Template downloaded successfully', 'success');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl text-white font-semibold z-50 transition-all transform duration-300 translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D5016]">Paint Stock Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Track paint stock levels, cost evaluations, and manage Excel import/export sheets.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow transition cursor-pointer"
          >
            Export to Excel
          </button>
          <button
            onClick={() => {
              setFormData({ name: '', color: '', currentStock: 0, soldCount: 0, cost: 0, supplier: '' });
              setShowAddModal(true);
            }}
            className="bg-[#2D5016] hover:bg-[#203a10] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow transition cursor-pointer"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Products</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalProducts}</h3>
          </div>
          <span className="text-3xl bg-gray-100 p-3 rounded-full">📦</span>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Low Stock items</p>
            <h3 className={`text-3xl font-extrabold mt-2 ${lowStockCount > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{lowStockCount}</h3>
          </div>
          <span className={`text-3xl p-3 rounded-full ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100'}`}>⚠️</span>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Stock Value</p>
            <h3 className="text-3xl font-extrabold text-[#2D5016] mt-2">Rs. {totalValue.toLocaleString()}</h3>
          </div>
          <span className="text-3xl bg-gray-100 p-3 rounded-full">💰</span>
        </div>
      </div>

      {/* Excel Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
        {/* Dropzone */}
        <div className="lg:col-span-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition flex flex-col justify-center items-center h-48 cursor-pointer ${
              isDragOver
                ? 'border-[#2D5016] bg-[#2D5016]/5'
                : 'border-gray-300 bg-white hover:border-[#2D5016]/60'
            }`}
          >
            <span className="text-4xl mb-3">📁</span>
            <p className="text-gray-700 font-semibold text-sm">Drag and Drop your Excel sheet (.xlsx, .xls) here</p>
            <p className="text-gray-400 text-xs mt-1">Or click to select a file from folders</p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileInputChange}
              className="absolute opacity-0 cursor-pointer h-48 w-full max-w-lg hidden"
              id="excel-file-picker"
            />
            <label htmlFor="excel-file-picker" className="mt-4 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg border border-gray-300 transition cursor-pointer">
              Choose File
            </label>
          </div>
        </div>

        {/* Template Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center h-48 flex flex-col justify-center items-center">
          <h4 className="text-sm font-bold text-gray-800">Excel Import Reference Template</h4>
          <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
            Download our standard preformatted Excel workbook to ensure correct data matching.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="mt-5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-bold text-xs shadow transition cursor-pointer"
          >
            Download Template
          </button>
        </div>
      </div>

      {/* Filters and List view */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#2D5016] focus:border-transparent transition w-full sm:w-64"
          />

          {/* Low Stock Check */}
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 select-none cursor-pointer w-full sm:w-auto">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => setLowStockFilter(e.target.checked)}
              className="w-4 h-4 rounded text-[#2D5016] focus:ring-[#2D5016] cursor-pointer"
            />
            <span>Show Low Stock Only</span>
          </label>
        </div>

        {/* Threshold input */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Low Stock Limit:</span>
          <input
            type="number"
            min="1"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Inventory List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016]"></div>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm py-16 text-center">
          <p className="text-gray-500 text-lg font-medium">No inventory products match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Color</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Cost Price</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Sold</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Current Stock</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Supplier</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-36">Last Updated</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const isLowStock = item.currentStock <= lowStockThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">{item.color}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                        Rs. {item.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 font-semibold">{item.soldCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold leading-none ${
                          isLowStock ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {item.currentStock} Units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs">{item.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs text-gray-400 font-medium">
                        {item.updatedAt ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => triggerEdit(item)}
                            className="text-[#2D5016] hover:text-[#203a10] bg-[#2D5016]/10 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== EXCEL IMPORT PREVIEW MODAL ==================== */}
      {excelPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-emerald-700">Confirm Excel Import</h2>
                <p className="text-xs text-gray-400 mt-0.5">Please preview matched columns below before saving to database.</p>
              </div>
              <button
                onClick={() => setExcelPreview(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Color</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-24">Sold</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-28">Net Stock</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase w-28">Cost (Rs)</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-150 text-sm">
                    {excelPreview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="px-4 py-3 font-bold text-gray-800">{row.name}</td>
                        <td className="px-4 py-3 text-gray-600">{row.color}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{row.soldCount}</td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{row.currentStock}</td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900">{row.cost.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{row.supplier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setExcelPreview(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExcelImport}
                  disabled={isMutating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md cursor-pointer disabled:bg-gray-400"
                >
                  {isMutating ? 'Importing...' : `Confirm Import (${excelPreview.length} Items)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD ITEM MANUAL MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2D5016]">Add Product Manually</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Gloss Enamel"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color *</label>
                <input
                  type="text"
                  placeholder="e.g. Signal Red"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cost Price (Rs) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Cost per unit"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opening Stock Level *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Sold */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Units Sold</label>
                <input
                  type="number"
                  min="0"
                  value={formData.soldCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, soldCount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Master Paint"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
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
                  {isMutating ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT ITEM MANUAL MODAL ==================== */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#2D5016]">Edit Product Details</h2>
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
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Gloss Enamel"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color *</label>
                <input
                  type="text"
                  placeholder="e.g. Signal Red"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cost Price (Rs) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Cost per unit"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Current Stock */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Stock Level *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>

              {/* Sold */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Units Sold</label>
                <input
                  type="number"
                  min="0"
                  value={formData.soldCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, soldCount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Master Paint"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition text-sm"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedItem.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold cursor-pointer"
                >
                  Delete Product
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedItem(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-bold cursor-pointer"
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
              Are you sure you want to remove this product from the inventory logs? All stock figures will be erased.
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
