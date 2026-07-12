'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { getFriendlyErrorMessage } from '@/lib/errorHandler';

export function ContactForm() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone.trim() && !/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message';
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      toast.success('Inquiry submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });

      setTimeout(() => {
        router.push('/contact/success');
      }, 1500);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-8">
      <h2 className="text-2xl font-extrabold text-[#2D5016] mb-2">Send us a Message</h2>
      <p className="text-gray-500 mb-8 text-sm">Have a question or custom request? Fill in the form below.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
            }`}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name}</p>
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

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
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
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.phone}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Your Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe your project, color specifications or general questions..."
            rows={4}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:border-transparent ${
              errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#2D5016]'
            }`}
            required
          />
          {errors.message && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2D5016] text-white py-3 rounded-lg font-bold hover:bg-[#203a10] disabled:bg-gray-400 transition mt-6 cursor-pointer shadow-lg text-sm"
        >
          {loading ? 'Sending Message...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
