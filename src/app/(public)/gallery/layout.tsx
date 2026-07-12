import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Portfolio Gallery',
  description: 'Explore photos of completed interior, exterior, commercial, and residential painting projects executed by Madina Paint Store in Khanewal, Punjab.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Project Portfolio Gallery | Madina Paint Store',
    description: 'Explore photos of completed interior, exterior, commercial, and residential painting projects executed by Madina Paint Store in Khanewal, Punjab.',
    url: 'https://madinapaintstore.vercel.app/gallery',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
