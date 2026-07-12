import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us & Location Map',
  description: 'Find contact numbers, email addresses, social media links, and step-by-step directions to Madina Paint Store in Khanewal, Punjab, Pakistan.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us & Location Map | Madina Paint Store',
    description: 'Find contact numbers, email addresses, social media links, and step-by-step directions to Madina Paint Store in Khanewal, Punjab, Pakistan.',
    url: 'https://madinapaintstore.vercel.app/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
