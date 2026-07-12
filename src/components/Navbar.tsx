import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#2D5016]">
            Madina <span className="text-[#E8B44D]">Paint</span> Store
          </span>
        </Link>

        <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
          <Link href="/services" className="hover:text-[#2D5016] transition-colors">
            Services
          </Link>
          <Link href="/gallery" className="hover:text-[#2D5016] transition-colors">
            Gallery
          </Link>
          <Link href="/booking" className="hover:text-[#2D5016] transition-colors">
            Book Appointment
          </Link>
          <Link href="/about" className="hover:text-[#2D5016] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#2D5016] transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            href="/booking"
            className="bg-[#2D5016] hover:bg-[#203a10] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </header>
  );
}
