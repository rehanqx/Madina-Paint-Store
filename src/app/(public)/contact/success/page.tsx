'use client';

import Link from 'next/link';

export default function ContactSuccessPage() {
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE || '+92 300 1234567';

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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#2D5016]">Thank You!</h1>
        </div>

        <p className="text-gray-600 mb-6 font-medium text-sm leading-relaxed">
          Your inquiry has been successfully received. A confirmation email has been sent to your address. Our team will review your message and respond shortly.
        </p>

        <div className="bg-[#2D5016]/5 border-l-4 border-[#2D5016] p-4 mb-8 text-left rounded-r-lg">
          <p className="text-sm text-gray-800 font-bold">
            Expected Timelines:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1.5 font-medium">
            <li>Standard Inquiries: Within 24 Hours</li>
            <li>Custom Commercial Estimates: 1-2 Days</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mb-6 font-medium">
          Need immediate support? Call us at{' '}
          <a href={`tel:${shopPhone.replace(/\s+/g, '')}`} className="text-[#2D5016] hover:text-[#203a10] font-bold">
            {shopPhone}
          </a>
        </p>

        <Link
          href="/"
          className="inline-block w-full bg-[#2D5016] hover:bg-[#203a10] text-white px-6 py-3 rounded-lg font-bold transition shadow-md cursor-pointer text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
