'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

interface ColorCard {
  id: string;
  name: string;
  hex: string;
  brand: string;
}

export default function ColorsManagerPage() {
  const { adminUser } = useAuth();
  const toast = useToast();
  
  const [colors, setColors] = useState<ColorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#2D5016');
  const [brand, setBrand] = useState('Master Paints');
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/colors');
      if (!res.ok) {
        throw new Error('Failed to retrieve color cards');
      }
      const items = await res.json();
      setColors(items);
    } catch (err) {
      console.error('Failed to load color cards:', err);
      toast.error('Failed to load color cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hex.trim() || !brand.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    // Validate hex code
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(hex)) {
      toast.error('Invalid Hex Code format (e.g. #2D5016)');
      return;
    }

    setIsMutating(true);
    try {
      const res = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          hex,
          brand,
          adminEmail: adminUser?.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create color card');
      }

      toast.success('Color card added successfully!');
      setName('');
      setHex('#2D5016');
      setBrand('Master Paints');
      setShowAddForm(false);
      fetchColors();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add color card');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteColor = async (id: string, colorName: string) => {
    if (!window.confirm(`Are you sure you want to delete color card "${colorName}"?`)) return;

    setIsMutating(true);
    try {
      const res = await fetch(`/api/colors?id=${id}&name=${encodeURIComponent(colorName)}&adminEmail=${adminUser?.email || ''}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete color card');
      }

      toast.success('Color card deleted successfully');
      fetchColors();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete color card');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-150 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Color Cards Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Manage color cards displayed in the public website color selector widget.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#2D5016] hover:bg-[#203a10] text-white px-4 py-2 rounded-lg font-bold text-sm transition cursor-pointer"
        >
          {showAddForm ? 'Close Form' : '+ Add Color Card'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddColor} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 max-w-xl">
          <h3 className="font-bold text-gray-900">New Color Card Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Color Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Gold"
                className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm text-gray-800 focus:border-[#2D5016] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brand *</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm text-gray-800 focus:border-[#2D5016] outline-none"
              >
                <option value="Master Paints">Master Paints</option>
                <option value="Berger Paints">Berger Paints</option>
                <option value="ICI Dulux">ICI Dulux</option>
                <option value="Jotun">Jotun</option>
                <option value="Brighto Paints">Brighto Paints</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hex Code *</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  placeholder="#FF0000"
                  className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-lg text-sm text-gray-800 focus:border-[#2D5016] outline-none"
                  required
                />
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-12 h-10 border border-gray-200 rounded-lg p-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isMutating}
            className="bg-[#2D5016] hover:bg-[#203a10] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow transition disabled:opacity-50 cursor-pointer"
          >
            {isMutating ? 'Saving...' : 'Save Color Card'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium animate-pulse">Loading color cards...</p>
        </div>
      ) : colors.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 font-medium">No color cards added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {colors.map((color) => (
            <div key={color.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
              <div>
                <div 
                  className="h-28 rounded-lg shadow-inner mb-4 relative border border-gray-100"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="absolute bottom-2 right-2 bg-white/90 text-gray-900 px-2 py-0.5 rounded text-xs font-bold font-mono border border-gray-100 shadow-sm">
                    {color.hex}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{color.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{color.brand}</p>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-4 flex justify-end">
                <button
                  onClick={() => handleDeleteColor(color.id, color.name)}
                  disabled={isMutating}
                  className="text-red-600 hover:text-red-800 font-bold text-sm transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
