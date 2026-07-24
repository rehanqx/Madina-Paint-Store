import ColorsCatalogClient from './ColorsCatalogClient';
import { adminDb } from '@/lib/firebaseAdmin';

interface ColorCard {
  id: string;
  name: string;
  hex: string;
  brand: string;
  createdAt?: string;
}

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export const metadata = {
  title: 'Color Catalog - Madina Paint Store',
  description: 'Browse our full catalog of premium paint brand colors and custom spectrometer matching options.',
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

async function getAllColors() {
  try {
    const snapshot = await adminDb.collection('color_cards').get();
    const items = snapshot.docs.map((doc) => serializeDoc<ColorCard>(doc));
    // Sort in-memory (newest first)
    items.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    return items;
  } catch (err) {
    console.error('Error fetching colors for catalog:', err);
    return [];
  }
}

export default async function ColorsCatalogPage() {
  const colors = await getAllColors();

  return <ColorsCatalogClient initialColors={colors} />;
}
