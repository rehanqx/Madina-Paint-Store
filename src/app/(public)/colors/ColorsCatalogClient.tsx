'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ColorCard {
  id: string;
  name: string;
  hex: string;
  brand: string;
}

interface ColorsCatalogClientProps {
  initialColors: ColorCard[];
}

export default function ColorsCatalogClient({ initialColors }: ColorsCatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const defaultColors = [
    { id: 'd1', name: 'Madina Forest Green', hex: '#2D5016', brand: 'Exclusive Store Color' },
    { id: 'd2', name: 'Imperial Sun Gold', hex: '#E8B44D', brand: 'Premium Gold Finish' },
    { id: 'd3', name: 'Soft Cream Silk', hex: '#FDFBF7', brand: 'ICI Dulux' },
    { id: 'd4', name: 'Jotun Desert Rose', hex: '#C29B96', brand: 'Jotun' },
    { id: 'd5', name: 'Berger Ocean Mist', hex: '#9BB8C2', brand: 'Berger Paints' },
    { id: 'd6', name: 'Master Royal Velvet', hex: '#583F66', brand: 'Master Paints' },
  ];

  const colors = initialColors.length > 0 ? initialColors : defaultColors;

  const brands = ['All', 'Master Paints', 'Berger Paints', 'ICI Dulux', 'Jotun', 'Brighto Paints', 'Other'];

  const filteredColors = colors.filter((color) => {
    const matchesSearch =
      color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.hex.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'All' || color.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const handleCopyHex = (hex: string, id: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hex)
        .then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {
          fallbackCopyText(hex, id);
        });
    } else {
      fallbackCopyText(hex, id);
    }
  };

  const fallbackCopyText = (text: string, id: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#2D5016] to-[#203a10] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-bold text-[#E8B44D] uppercase tracking-[0.2em] bg-white/10 px-4 py-1.5 rounded-full mb-3 inline-block">
            Full Catalog
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Premium Color Catalog</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto font-medium">
            Browse through our extensive library of brand paint swatches. Copy any color code or book an exact site matching service.
          </p>
        </div>
      </div>

      {/* Main Filter & Grid Container */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        
        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Search bar */}
          <div className="flex-grow max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search colors by name or hex code..."
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm focus:border-[#2D5016] focus:bg-white outline-none text-gray-800 font-medium"
            />
          </div>
          {/* Brand Filter */}
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition duration-200 cursor-pointer ${
                  selectedBrand === brand
                    ? 'bg-[#2D5016] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Colors Grid */}
        {filteredColors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-400 font-medium text-lg">No colors match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredColors.map((color) => (
              <div
                key={color.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
              >
                <div>
                  <div
                    className="h-32 rounded-xl mb-4 shadow-inner border border-gray-100 relative"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="absolute bottom-2 right-2 bg-white/90 text-gray-900 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-gray-100">
                      {color.hex}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm truncate leading-snug">{color.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{color.brand}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3.5 mt-4">
                  <button
                    onClick={() => handleCopyHex(color.hex, color.id)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-lg text-[10px] transition cursor-pointer text-center"
                  >
                    {copiedId === color.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                  <Link
                    href={`/booking?service=Color%20Matching&color=${encodeURIComponent(
                      `${color.name} (${color.hex})`
                    )}`}
                    className="bg-[#2D5016] hover:bg-[#203a10] text-white font-bold py-2 rounded-lg text-[10px] transition cursor-pointer flex items-center justify-center text-center font-sans"
                  >
                    📅 Match
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA section */}
        <div className="mt-16 bg-gray-900 text-white p-8 rounded-2xl text-center max-w-3xl mx-auto shadow-xl">
          <h3 className="text-2xl font-extrabold mb-2">Can't Find Your Perfect Shade?</h3>
          <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Bring any paint scrap, fabric, or physical sample to our showroom. Our computer spectrometer will replicate it with 100% precision.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 px-6 py-3 rounded-lg font-bold text-xs transition duration-200"
          >
            Locate Showroom
          </Link>
        </div>

      </div>
    </div>
  );
}
