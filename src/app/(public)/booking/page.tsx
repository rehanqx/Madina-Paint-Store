import BookingPageClient from './BookingPageClient';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Service {
  id: string;
  name: string;
  pricing: number;
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata = {
  title: 'Book a Consultation - Madina Paint Store',
  description: 'Schedule a professional painting estimation, consultation, or color matching review at your site.',
};

async function getServices() {
  try {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || '',
      pricing: doc.data().pricing || 0,
    })) as Service[];
  } catch (err) {
    console.error('Error fetching services on booking server:', err);
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const services = await getServices();
  const resolvedParams = await searchParams;
  const selectedServiceId = resolvedParams.service || '';

  return (
    <BookingPageClient 
      services={services} 
      selectedServiceId={selectedServiceId} 
    />
  );
}
