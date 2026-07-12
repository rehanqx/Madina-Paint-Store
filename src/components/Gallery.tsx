'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  service_category: string;
  description: string;
  order: number;
}

const categories = [
  { id: 'all', label: 'All Projects' },
  { id: 'interior', label: 'Interior' },
  { id: 'exterior', label: 'Exterior' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'residential', label: 'Residential' },
];

export function Gallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const galleryRef = collection(db, 'gallery');
        const q = query(galleryRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        const galleryData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryItem[];
        setImages(galleryData);
        setFilteredImages(galleryData);
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError('Failed to load gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setFilteredImages(images);
    } else {
      setFilteredImages(
        images.filter((img) => img.service_category === categoryId)
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading portfolio gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
              selectedCategory === category.id
                ? 'bg-[#2D5016] text-white shadow-lg'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg font-medium">No images found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative h-64 bg-gray-200 overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-[#2D5016] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 shadow-md">
                  View Details
                </button>
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 text-white">
                <h3 className="font-bold text-lg leading-tight">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{selectedImage.title}</h2>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-800 text-3xl font-light cursor-pointer leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-6 border border-gray-200 shadow-sm">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"%3E%3Crect fill="%23e5e7eb" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</h3>
                  <p className="text-base text-gray-900 font-semibold capitalize mt-1">{selectedImage.service_category}</p>
                </div>

                {selectedImage.description && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                    <p className="text-gray-700 mt-1.5 text-sm leading-relaxed">{selectedImage.description}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="w-full mt-8 bg-[#2D5016] text-white py-3 rounded-lg font-bold hover:bg-[#203a10] transition shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
