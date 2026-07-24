import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="max-w-xs md:max-w-[280px]">
          <h3 className="text-white text-lg font-semibold mb-4">Madina Paint Store</h3>
          <p className="text-sm leading-relaxed text-justify">
            Your premium destination for high-quality paints, custom color matching, and professional site consultation services in Khanewal, Punjab.
          </p>
        </div>
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
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
          <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Email: {process.env.NEXT_PUBLIC_SHOP_EMAIL || 'madinapaintstore09@gmail.com'}</li>
            <li>Phone: {process.env.NEXT_PUBLIC_SHOP_PHONE || '+92 300 6893082'}</li>
            <li>Address: {process.env.NEXT_PUBLIC_SHOP_ADDRESS || 'Madina Town, Nirala Sweet, Khanewal'}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Developer</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Name: Muhammad Rehan Afzal</li>
            <li>
              Email:{" "}
              <a href="mailto:0xrehan.developer@gmail.com" className="hover:text-white transition-colors">
                0xrehan.developer@gmail.com              </a>
            </li>
            
             <li>
              Portfolio:{" "}
              <a
                href="https://trade.monsternetwork.site"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                rehan.dev
              </a>
            </li>
            <li>
              GitHub:{" "}
              <a
                href="https://github.com/rehanqx"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                github.com/rehanqx
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs">
        &copy; {new Date().getFullYear()} Madina Paint Store. All rights reserved.
      </div>
    </footer>
  );
}
