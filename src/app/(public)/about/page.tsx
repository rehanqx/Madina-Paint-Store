import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Hero Section */}
      <div className="bg-gradient-to-r from-[#2D5016] to-[#203a10] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About Madina Paint Store</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover our legacy of quality, innovation, and unmatched dedication to color precision in Khanewal.
          </p>
        </div>
      </div>

      {/* 2. Our Story Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Legacy & History</h2>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                Established with a vision to redefine the paint shopping experience, <strong>Madina Paint Store</strong> has grown to become the premier retail destination for decorative, commercial, and industrial coatings in Khanewal, Punjab.
              </p>
              <p>
                For years, we have served local homeowners, interior designers, and construction contractors by offering an extensive catalog of top-grade paints combined with professional on-site support. Our dedication to quality products has earned us trust and a stellar local reputation.
              </p>
              <p>
                We specialize in advanced computer-aided spectrometer color matching, allowing us to replicate any physical sample with 100% exact precision. Whether you are executing a minor bedroom refresh or building a large-scale commercial plaza, we supply the exact paints, finishes, and tools you need.
              </p>
            </div>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-gray-200">
            <OptimizedImage
              src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80"
              alt="Color swatches and matching at Madina Paint Store"
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      {/* 3. Core Pillars / Services */}
      <div className="bg-white border-t border-b border-gray-200 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Pillars of Excellence</h2>
            <p className="text-gray-500 mt-2 font-medium">The key values that drive our service and product catalog.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Color Matching */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition duration-200">
              <div className="w-14 h-14 bg-[#2D5016]/10 text-[#2D5016] rounded-full flex items-center justify-center text-2xl mx-auto mb-5">
                🎨
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Spectrometer Precision</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Take the guesswork out of painting. Our specialized spectrometer matches any physical sample to get the exact color shade.
              </p>
            </div>

            {/* Premium Brands */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition duration-200">
              <div className="w-14 h-14 bg-[#E8B44D]/15 text-[#d4a03b] rounded-full flex items-center justify-center text-2xl mx-auto mb-5">
                💎
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Top Paint Brands</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We are authorized dealers of premium international and local brands, ensuring durability, weather-resistance, and vibrance.
              </p>
            </div>

            {/* Vetted Painters */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition duration-200">
              <div className="w-14 h-14 bg-[#DC2626]/10 text-[#DC2626] rounded-full flex items-center justify-center text-2xl mx-auto mb-5">
                👷
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Painters</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Get connected with our network of local, background-checked professional painters for clean, fast, and high-quality job completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mission and Vision */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-[#2D5016] mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              To supply premium, environment-friendly coating solutions that beautify and protect our community’s spaces, backed by state-of-the-art technological color matching and reliable expert consultations.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-[#2D5016] mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              To become the most trusted name in painting and decorative solutions across the Punjab region, known for technical innovation, transparent customer relations, and support for sustainable building practices.
            </p>
          </div>
        </div>
      </div>

      {/* 5. CTA Section */}
      <div className="bg-[#2D5016] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Begin Your Painting Project?</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-lg mx-auto font-medium">
            Contact our paint specialists or schedule an on-site consultation to get a detailed estimation report today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 font-bold px-8 py-3.5 rounded-lg transition shadow-lg cursor-pointer text-center text-sm"
            >
              Book Consultation
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold px-8 py-3.5 rounded-lg transition-all cursor-pointer text-center text-sm"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
