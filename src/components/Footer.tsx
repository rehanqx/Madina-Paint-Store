import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Madina Paint Store</h3>
          <p className="text-sm leading-relaxed">
            Your premium destination for high-quality paints, custom color matching, and professional consultation services. Let us bring color to your world.
          </p>
        </div>
        <div>
          <h4 className="text-white text-md font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            </li>
            <li>
              <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
            </li>
            <li>
              <Link href="/booking" className="hover:text-white transition-colors">Booking</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-md font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: info@madinapaintstore.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Main Street, Paint City</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs">
        &copy; {new Date().getFullYear()} Madina Paint Store. All rights reserved.
      </div>
    </footer>
  );
}
