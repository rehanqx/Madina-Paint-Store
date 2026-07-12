'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';

interface Service {
  id: string;
  name: string;
  description: string;
  pricing: number;
  image_urls: string[];
  category: string;
}

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  service_category: string;
}

interface HomePageClientProps {
  featuredServices: Service[];
  recentGallery: GalleryItem[];
}

export default function HomePageClient({ featuredServices, recentGallery }: HomePageClientProps) {
  const testimonials = [
    {
      id: 1,
      name: 'Muhammad Ali',
      initials: 'MA',
      rating: 5,
      text: 'Madina Paint Store provided exceptional service. The spectrometer color matching matched my living room walls perfectly! Vetted painters did a super clean job.',
    },
    {
      id: 2,
      name: 'Sarah Khan',
      initials: 'SK',
      rating: 5,
      text: 'Highly professional team. They helped me choose the right paint grade for my commercial store facade. Recommended for fast and clean painting work.',
    },
    {
      id: 3,
      name: 'Usman Sheikh',
      initials: 'US',
      rating: 5,
      text: 'Fast, on-time, and reliable estimates. They explained all material differences clearly and completed the job within budget. Very satisfied with my bedroom renovation.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      {/* 1. Hero Section */}
      <section 
        className="relative bg-black text-white py-24 md:py-36 px-4 bg-cover bg-center overflow-hidden border-b border-gray-100"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-[#2D5016]/10 mix-blend-multiply"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-md">
            Professional Painting Services For <span className="text-[#E8B44D]">Your Spaces</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto font-medium drop-shadow">
            Experience perfect spectrometer color matching and premium quality paints. Schedule your consultation with our vetted local painting experts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 font-bold px-8 py-3.5 rounded-lg transition shadow-lg cursor-pointer text-center"
            >
              Book Now
            </Link>
            <Link
              href="/gallery"
              className="w-full sm:w-auto border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold px-8 py-3.5 rounded-lg transition-all cursor-pointer text-center"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Services Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Featured Services</h2>
            <p className="text-gray-500 mt-2 font-medium">Explore some of our top painting services available to book today.</p>
          </div>

          {featuredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No services loaded. Visit the services catalog for more detail.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <div 
                  key={service.id} 
                  className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-gray-100">
                    <OptimizedImage 
                      src={service.image_urls?.[0] || ''} 
                      alt={service.name} 
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{service.description}</p>
                    </div>
                    <div className="mt-4">
                      <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-4">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Starting from</span>
                        <span className="text-xl font-extrabold text-[#2D5016]">Rs. {service.pricing.toLocaleString()}</span>
                      </div>
                      <Link 
                        href="/services"
                        className="block w-full text-center bg-[#2D5016]/10 hover:bg-[#2D5016] hover:text-white text-[#2D5016] py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Why Choose Us Section */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 border-t border-b border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Why Choose Us</h2>
            <p className="text-gray-500 mt-2 font-medium">Why we are the preferred choice for homeowners and builders in the area.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Experience */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#2D5016]/10 text-[#2D5016] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🏆
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Proven Experience</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Years of executing complex industrial coating and decorative house painting setups.
              </p>
            </div>

            {/* Quality */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#E8B44D]/15 text-[#d4a03b] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ✨
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Computer-aided spectrometer color matches and durable top-grade paints catalog.
              </p>
            </div>

            {/* Speed */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#DC2626]/10 text-[#DC2626] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast & On-Time</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Disciplined cleanup workflows ensuring schedules are met without disruption.
              </p>
            </div>

            {/* Reliability */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🤝
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Vetted Painters</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Professional local staff committed to transparent pricing and reliable estimate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Gallery Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Recent Projects Showcase</h2>
            <p className="text-gray-500 mt-2 font-medium font-sans">A glimpse of our latest completed painting and matching projects.</p>
          </div>

          {recentGallery.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No project showcase loaded. Check back later.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentGallery.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl shadow-md border border-gray-100 aspect-video bg-gray-100 cursor-pointer"
                  >
                    <OptimizedImage 
                      src={item.image_url} 
                      alt={item.title} 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-sm leading-snug">{item.title}</h4>
                      <p className="text-gray-300 text-xs mt-1 capitalize font-medium">{item.service_category}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/gallery"
                  className="inline-block border border-gray-300 hover:border-[#2D5016] text-gray-700 hover:text-[#2D5016] font-bold px-8 py-3 rounded-lg text-sm transition shadow-sm cursor-pointer"
                >
                  View Full Gallery
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-16 md:py-24 px-4 bg-gray-50 border-t border-b border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">What Our Clients Say</h2>
            <p className="text-gray-500 mt-2 font-medium">Read verified feedback reviews from residential and commercial shop clients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <div 
                key={test.id}
                className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex space-x-1 text-[#E8B44D] mb-4">
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <span key={i} className="text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed italic mb-6">"{test.text}"</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#2D5016] text-white flex items-center justify-center font-bold text-sm shadow">
                    {test.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-none">{test.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Call to Action Section */}
      <section className="bg-gradient-to-r from-[#2D5016] to-[#203a10] text-white py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Transform Your Space?</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-lg mx-auto font-medium">
            Contact us for expert spectrometer matching advice or schedule a detailed painting estimate online.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 font-bold px-8 py-3.5 rounded-lg transition shadow-lg cursor-pointer text-center text-sm"
            >
              Book Now
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto border-2 border-white/80 hover:bg-white hover:text-gray-900 text-white font-bold px-8 py-3.5 rounded-lg transition-all cursor-pointer text-center text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
