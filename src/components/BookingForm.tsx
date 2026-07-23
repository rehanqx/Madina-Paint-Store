'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { getFriendlyErrorMessage } from '@/lib/errorHandler';

interface BookingFormProps {
  services: Array<{ id: string; name: string; pricing: number }>;
  initialServiceId?: string;
}

export function BookingForm({ services, initialServiceId }: BookingFormProps) {
  const router = useRouter();
  const toast = useToast();

  const initialService = services.find(s => s.id === initialServiceId);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: initialService ? initialService.name : '',
    bookingDate: '',
    bookingTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const selected = services.find(s => s.id === initialServiceId);
    if (selected) {
      setFormData(prev => ({ ...prev, serviceType: selected.name }));
    } else if (initialServiceId === '') {
      setFormData(prev => ({ ...prev, serviceType: '' }));
    }
  }, [initialServiceId, services]);

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
    // Clear field validation error when fixed
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Please enter your name';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Please enter your site address';
    }
    if (!formData.serviceType) {
      newErrors.serviceType = 'Please select a painting package';
    }
    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Please select a date';
    }
    if (!formData.bookingTime) {
      newErrors.bookingTime = 'Please select a time slot';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      toast.error('Please correct the validation errors in the form.');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

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
      toast.success('Booking submitted successfully!');

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

      // Redirect after message display
      setTimeout(() => {
        router.push('/booking/success?bookingId=' + result.bookingId);
      }, 1500);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8">
        <h2 className="text-3xl font-extrabold text-[#2D5016] mb-2">Book Our Services</h2>
        <p className="text-gray-500 mb-8 text-sm">Fill in the form below to book a professional painting service.</p>

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
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
                errors.customerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
              }`}
              required
            />
            {errors.customerName && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.customerName}</p>
            )}
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
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
                errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
              }`}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.phone}</p>
            )}
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
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email}</p>
            )}
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
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
                errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
              }`}
              required
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.address}</p>
            )}
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
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
                errors.serviceType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
              }`}
              required
            >
              <option value="">-- Choose Painting Service --</option>
              
              <optgroup label="General Painting Categories">
                <option value="Interior Painting">Interior Painting</option>
                <option value="Exterior Painting">Exterior Painting</option>
                <option value="Commercial Painting">Commercial Painting</option>
                <option value="Residential Painting">Residential Painting</option>
              </optgroup>

              {services.length > 0 && (
                <optgroup label="Vetted Package Offers">
                  {services.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name} (Rs. {service.pricing})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {errors.serviceType && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.serviceType}</p>
            )}
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
              className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
                errors.bookingDate ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
              }`}
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">Minimum booking date: Tomorrow</p>
            {errors.bookingDate && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.bookingDate}</p>
            )}
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
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      bookingTime: time,
                    }));
                    if (errors.bookingTime) {
                      setErrors((prev) => ({ ...prev, bookingTime: '' }));
                    }
                  }}
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
            {errors.bookingTime && (
              <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.bookingTime}</p>
            )}
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
