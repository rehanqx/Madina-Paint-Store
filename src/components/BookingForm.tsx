'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  services: Array<{ id: string; name: string; pricing: number }>;
}

export function BookingForm({ services }: BookingFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: '',
    bookingDate: '',
    bookingTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Available time slots
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  // Get minimum date (today or tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Please enter your address');
      return false;
    }
    if (!formData.serviceType) {
      setError('Please select a service');
      return false;
    }
    if (!formData.bookingDate) {
      setError('Please select a date');
      return false;
    }
    if (!formData.bookingTime) {
      setError('Please select a time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Submit booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      const result = await response.json();
      setSuccess(true);

      // Reset form
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        address: '',
        serviceType: '',
        bookingDate: '',
        bookingTime: '',
      });

      // Show success message and redirect
      setTimeout(() => {
        router.push('/booking/success?bookingId=' + result.bookingId);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-[#2D5016] mb-2">Book Our Services</h2>
        <p className="text-gray-500 mb-8">Fill in the form below to book a professional painting service.</p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-semibold text-sm">
            ✓ Booking submitted successfully! You will be redirected shortly.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-semibold text-sm">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+92 300 1234567"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Site Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete site address"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select Service *
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
              required
            >
              <option value="">-- Choose Painting Service --</option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name} (Rs. {service.pricing})
                </option>
              ))}
            </select>
          </div>

          {/* Booking Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Preferred Date *
            </label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              min={getMinDate()}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5016] focus:border-transparent outline-none transition"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Minimum booking date: Tomorrow</p>
          </div>

          {/* Booking Time */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Preferred Time Slot *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      bookingTime: time,
                    }))
                  }
                  className={`py-2 px-3 rounded-lg text-sm font-bold transition active:scale-95 cursor-pointer ${
                    formData.bookingTime === time
                      ? 'bg-[#2D5016] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            {formData.bookingTime && (
              <p className="text-sm text-gray-600 mt-3 font-medium">
                Selected Time: <strong className="text-[#2D5016]">{formData.bookingTime}</strong>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D5016] text-white py-3 rounded-lg font-bold hover:bg-[#203a10] disabled:bg-gray-400 transition mt-8 cursor-pointer shadow-lg"
          >
            {loading ? 'Submitting Booking...' : 'Confirm Booking'}
          </button>

          <p className="text-xs text-gray-400 text-center font-medium">
            We will contact you shortly to confirm your consultation schedule
          </p>
        </form>
      </div>
    </div>
  );
}
