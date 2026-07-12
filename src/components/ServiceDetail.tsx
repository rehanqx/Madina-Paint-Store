'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  pricing: number;
  image_urls: string[];
  category: string;
}

interface ServiceDetailProps {
  serviceId: string;
}

export function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchService() {
      try {
        const serviceRef = doc(db, 'services', serviceId);
        const snapshot = await getDoc(serviceRef);
        if (snapshot.exists()) {
          setService({
            id: snapshot.id,
            ...snapshot.data(),
          } as Service);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    }

    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      {service.image_urls && service.image_urls.length > 0 && (
        <div>
          <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4 border border-gray-100">
            <img
              src={service.image_urls[currentImageIndex]}
              alt={service.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"%3E%3Crect fill="%23e5e7eb" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {service.image_urls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {service.image_urls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    currentImageIndex === index
                      ? 'border-[#2D5016] scale-95 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={url}
                    alt={`${service.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Info */}
      <div className="space-y-4">
        <div>
          <span className="inline-block bg-[#2D5016]/10 text-[#2D5016] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            {service.category}
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{service.name}</h1>
        </div>

        <p className="text-lg text-gray-600 leading-relaxed">{service.description}</p>

        <div className="bg-[#2D5016]/5 border-l-4 border-[#2D5016] p-6 rounded-r-lg">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Starting Price</p>
          <p className="text-4xl font-extrabold text-[#2D5016] mt-1">
            Rs. {service.pricing.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            Actual price may vary based on project scope, space measurements, and material grades.
          </p>
        </div>

        <Link
          href="/booking"
          className="inline-block bg-[#2D5016] hover:bg-[#203a10] text-white px-8 py-3.5 rounded-lg font-bold transition shadow-lg cursor-pointer"
        >
          Book This Service
        </Link>
      </div>
    </div>
  );
}
