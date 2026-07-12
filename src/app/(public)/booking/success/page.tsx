'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessDetails() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <>
      {bookingId && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Booking ID</p>
          <p className="text-lg font-mono font-semibold text-gray-900 mt-1">{bookingId}</p>
        </div>
      )}
    </>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#2D5016]">Booking Confirmed!</h1>
        </div>

        <p className="text-gray-600 mb-4 font-medium text-sm leading-relaxed">
          Your booking has been successfully submitted. We will contact you shortly to confirm all details.
        </p>

        <Suspense fallback={
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        }>
          <SuccessDetails />
        </Suspense>

        <div className="bg-[#2D5016]/5 border-l-4 border-[#2D5016] p-4 mb-8 text-left rounded-r-lg">
          <p className="text-sm text-gray-800 font-bold">
            Next Steps:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1.5 font-medium">
            <li>Check your email for confirmation</li>
            <li>We'll call you on the provided number</li>
            <li>Confirm final details before service</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mb-6 font-medium">
          Questions? Contact us at{' '}
          <a href="tel:+923001234567" className="text-[#2D5016] hover:text-[#203a10] font-bold">
            +92 300 1234567
          </a>
        </p>

        <Link
          href="/"
          className="inline-block w-full bg-[#2D5016] hover:bg-[#203a10] text-white px-6 py-3 rounded-lg font-bold transition shadow-md cursor-pointer"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
