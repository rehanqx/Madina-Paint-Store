'use client';

import { BookingForm } from '@/components/BookingForm';

interface Service {
  id: string;
  name: string;
  pricing: number;
}

interface BookingPageClientProps {
  services: Service[];
}

export default function BookingPageClient({ services }: BookingPageClientProps) {
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
