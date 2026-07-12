import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the legacy, operations, custom coloring services, and dedication of Madina Paint Store in Khanewal, Punjab.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | Madina Paint Store',
    description: 'Learn about the legacy, operations, custom coloring services, and dedication of Madina Paint Store in Khanewal, Punjab.',
    url: 'https://madinapaintstore.vercel.app/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
