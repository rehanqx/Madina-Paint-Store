'use client';

import { BookingForm } from '@/components/BookingForm';

interface Service {
  id: string;
  name: string;
  pricing: number;
}

interface BookingPageClientProps {
  services: Service[];
  selectedServiceId: string;
}

export default function BookingPageClient({ services, selectedServiceId }: BookingPageClientProps) {
  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Book a Paint Service</h1>
          <p className="text-lg text-gray-600">
            Schedule your professional painting estimate or consultation at your convenience.
          </p>
        </div>

        {selectedService && (
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl border-2 border-[#2D5016] shadow-md p-6 text-center max-w-sm w-full transition duration-300">
              <span className="bg-[#2D5016]/10 text-[#2D5016] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Selected Package</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedService.name}</h3>
              <p className="text-xl font-extrabold text-[#2D5016]">Rs. {selectedService.pricing}</p>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <BookingForm services={services} initialServiceId={selectedServiceId} />
      </div>
    </div>
  );
}
