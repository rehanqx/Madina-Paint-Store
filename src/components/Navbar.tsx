'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/booking", label: "Book Appointment" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-[#2D5016] whitespace-nowrap">
            Madina <span className="text-[#E8B44D]">Paint</span> Store
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-6 lg:space-x-8 text-sm font-semibold text-gray-700">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-[#2D5016] ${
                  isActive ? "text-[#2D5016]" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA / Hamburger Trigger */}
        <div className="flex items-center space-x-4">
          <Link
            href="/booking"
            className="hidden lg:inline-block bg-[#2D5016] hover:bg-[#203a10] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors"
          >
            Book Consultation
          </Link>

          {/* Mobile hamburger menu button (min 48px touch target area) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden flex items-center justify-center w-12 h-12 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="text-xl font-bold">{isOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-150 bg-white shadow-xl animate-fade-in">
          <nav className="flex flex-col p-4 space-y-3.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#2D5016]/10 text-[#2D5016]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="block text-center bg-[#2D5016] hover:bg-[#203a10] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md transition"
            >
              Book Consultation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
