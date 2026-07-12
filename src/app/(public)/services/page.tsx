import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata = {
  title: 'Painting Services Catalog - Madina Paint Store',
  description: 'Explore our premium selection of interior, exterior, commercial, and residential painting packages.',
};

async function getServices() {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[];
  } catch (err) {
    console.error('Error fetching services on server:', err);
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2D5016] to-[#203a10] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Painting Services</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Professional painting services tailored to your needs. From interior 
            elegance to exterior durability, we deliver quality and excellence.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {services.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg font-medium">No painting services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Service Image */}
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                  {service.image_urls && service.image_urls.length > 0 ? (
                    <OptimizedImage
                      src={service.image_urls[0]}
                      alt={service.name}
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400 font-medium">No image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[#2D5016] text-white px-3 py-1 rounded-full text-xs font-bold capitalize shadow-md">
                    {service.category}
                  </div>
                </div>

                {/* Service Info */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    {/* Pricing */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Starting from</p>
                      <p className="text-3xl font-extrabold text-[#2D5016] mt-1">
                        Rs. {service.pricing.toLocaleString()}
                      </p>
                    </div>

                    {/* Button */}
                    <Link
                      href={`/booking?service=${service.id}`}
                      className="w-full inline-block bg-[#2D5016] hover:bg-[#203a10] text-white text-center py-3 rounded-lg font-bold transition shadow-md cursor-pointer"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-[#2D5016] text-white py-16 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">Need a Custom Painting Solution?</h2>
          <p className="text-lg text-gray-200 mb-8 max-w-lg mx-auto">
            Contact our color matching experts for personalized estimates, projects support, and specific queries.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-[#2D5016] px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition shadow-lg cursor-pointer"
          >
            Get a Free Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
