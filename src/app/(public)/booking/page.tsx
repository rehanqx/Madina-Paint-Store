'use client';

import { useEffect, useState } from 'react';
import { BookingForm } from '@/components/BookingForm';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Service {
  id: string;
  name: string;
  pricing: number;
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const servicesRef = collection(db, 'services');
        const snapshot = await getDocs(servicesRef);
        const servicesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5016] mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading painting services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Book a Paint Service</h1>
          <p className="text-lg text-gray-600">
            Schedule your professional painting estimate or consultation at your convenience.
          </p>
        </div>

        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Services Overview */}
            {services.slice(0, 3).map((service) => (
              <div key={service.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-xl font-extrabold text-[#2D5016]">Rs. {service.pricing}</p>
              </div>
            ))}
          </div>
        )}

        {/* Booking Form */}
        <BookingForm services={services} />
      </div>
    </div>
  );
}
