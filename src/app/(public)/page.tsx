import HomePageClient from './HomePageClient';
import { adminDb } from '@/lib/firebaseAdmin';

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

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata = {
  title: 'Madina Paint Store - Professional Painting Services & Estimates',
  description: 'Experience perfect spectrometer color matching and premium quality paints. Schedule your site estimate consultation with our vetted local painting experts.',
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

async function getFeaturedServices() {
  try {
    const snapshot = await adminDb.collection('services').limit(3).get();
    return snapshot.docs.map((doc) => serializeDoc<Service>(doc));
  } catch (err) {
    console.error('Error fetching services for homepage:', err);
    return [];
  }
}

async function getRecentGallery() {
  try {
    const snapshot = await adminDb.collection('gallery').orderBy('order', 'asc').limit(6).get();
    return snapshot.docs.map((doc) => serializeDoc<GalleryItem>(doc));
  } catch (err) {
    console.error('Error fetching gallery for homepage:', err);
    return [];
  }
}

async function getColorCards() {
  try {
    const snapshot = await adminDb.collection('color_cards').get();
    return snapshot.docs.map((doc) => serializeDoc<any>(doc));
  } catch (err) {
    console.error('Error fetching color cards for homepage:', err);
    return [];
  }
}

export default async function HomePage() {
  const [featuredServices, recentGallery, colorCards] = await Promise.all([
    getFeaturedServices(),
    getRecentGallery(),
    getColorCards(),
  ]);

  return (
    <HomePageClient
      featuredServices={featuredServices}
      recentGallery={recentGallery}
      colorCards={colorCards}
    />
  );
}
