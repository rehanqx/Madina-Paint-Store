import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Painting Services Catalog',
  description: 'Explore our premium catalog of interior, exterior, commercial, and residential painting services. Schedule consultations online with Madina Paint Store.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Painting Services Catalog | Madina Paint Store',
    description: 'Explore our premium catalog of interior, exterior, commercial, and residential painting services. Schedule consultations online with Madina Paint Store.',
    url: 'https://madinapaintstore.vercel.app/services',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Painting and Decoration Services",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Madina Paint Store",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Main Bazar",
        "addressLocality": "Khanewal",
        "addressRegion": "Punjab",
        "addressCountry": "PK"
      }
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Khanewal"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Painting Services Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Interior Painting"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Exterior Painting"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Commercial Painting"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Residential Painting"
          }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
