import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Painting Consultation',
  description: 'Book a professional painting estimate consultation. Choose services, select date and time slots, and verify your details for Madina Paint Store.',
  alternates: {
    canonical: '/booking',
  },
  openGraph: {
    title: 'Book Painting Consultation | Madina Paint Store',
    description: 'Book a professional painting estimate consultation. Choose services, select date and time slots, and verify your details for Madina Paint Store.',
    url: 'https://madinapaintstore.vercel.app/booking',
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
