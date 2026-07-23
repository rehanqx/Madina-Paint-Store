import { Gallery } from '@/components/Gallery';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  service_category: string;
  description: string;
  order: number;
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata = {
  title: 'Gallery - Madina Paint Store',
  description: 'View our portfolio of completed professional painting projects',
};

function serializeDoc<T>(doc: any): T {
  const data = doc.data();
  const serialized: any = { id: doc.id };
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val === 'object' && val.toDate && typeof val.toDate === 'function') {
      serialized[key] = val.toDate().toISOString();
    } else {
      serialized[key] = val;
    }
  }
  return serialized as T;
}

async function getGalleryItems() {
  try {
    const galleryRef = collection(db, 'gallery');
    const q = query(galleryRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => serializeDoc<GalleryItem>(doc));
  } catch (err) {
    console.error('Error fetching gallery on server:', err);
    return [];
  }
}

export default async function GalleryPage() {
  const images = await getGalleryItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2D5016] to-[#203a10] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Projects Gallery</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Explore our portfolio of completed projects and see the quality 
            of our work firsthand.
          </p>
        </div>
      </div>

      {/* Gallery Showcase */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Gallery initialImages={images} />
      </div>

      {/* Contact CTA */}
      <div className="bg-gray-900 text-white py-20 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">Like What You See?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
            Let's discuss your painting project and bring your vision to life.
          </p>
          
          <Link
            href="/booking"
            className="inline-block bg-[#E8B44D] hover:bg-[#d4a03b] text-gray-900 px-8 py-3.5 rounded-lg font-bold transition shadow-lg cursor-pointer"
          >
            Book a Service
          </Link>
        </div>
      </div>
    </div>
  );
}
