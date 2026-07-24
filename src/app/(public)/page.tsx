import HomePageClient from './HomePageClient';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

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
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, limit(3));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => serializeDoc<Service>(doc));
  } catch (err) {
    console.error('Error fetching services for homepage:', err);
    return [];
  }
}

async function getRecentGallery() {
  try {
    const galleryRef = collection(db, 'gallery');
    const q = query(galleryRef, orderBy('order', 'asc'), limit(6));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => serializeDoc<GalleryItem>(doc));
  } catch (err) {
    console.error('Error fetching gallery for homepage:', err);
    return [];
  }
}

async function getColorCards() {
  try {
    const colorsRef = collection(db, 'color_cards');
    const snapshot = await getDocs(colorsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      hex: doc.data().hex || '',
      brand: doc.data().brand || '',
    }));
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
