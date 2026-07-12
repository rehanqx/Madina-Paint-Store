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

async function getFeaturedServices() {
  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, limit(3));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[];
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
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as GalleryItem[];
  } catch (err) {
    console.error('Error fetching gallery for homepage:', err);
    return [];
  }
}

export default async function HomePage() {
  const [featuredServices, recentGallery] = await Promise.all([
    getFeaturedServices(),
    getRecentGallery(),
  ]);

  return (
    <HomePageClient
      featuredServices={featuredServices}
      recentGallery={recentGallery}
    />
  );
}
