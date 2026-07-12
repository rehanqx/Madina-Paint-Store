import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2D5016",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://madinapaintstore.vercel.app"),
  title: {
    default: "Madina Paint Store | Premium Paints & Painting Services in Khanewal",
    template: "%s | Madina Paint Store",
  },
  description: "Explore premium paint brands, custom color matching, and professional interior/exterior painting services at Madina Paint Store in Khanewal, Punjab.",
  keywords: [
    "Madina Paint Store",
    "Paint Shop Khanewal",
    "Painting Services Punjab",
    "Color Matching Khanewal",
    "Master Paint Pakistan",
    "Berger Paint Pakistan",
    "Dulux Paint Pakistan",
    "Best Painters Khanewal",
    "Home Painting Pakistan",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Madina Paint Store | Premium Paints & Painting Services",
    description: "Explore premium paint brands, custom color matching, and professional painting services in Khanewal, Punjab.",
    url: "https://madinapaintstore.vercel.app",
    siteName: "Madina Paint Store",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Madina Paint Store Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Madina Paint Store | Premium Paints & Painting Services",
    description: "Explore premium paint brands, custom color matching, and professional painting services in Khanewal, Punjab.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Madina Paint Store",
    "image": "https://madinapaintstore.vercel.app/og-image.jpg",
    "@id": "https://madinapaintstore.vercel.app/#localbusiness",
    "url": "https://madinapaintstore.vercel.app",
    "telephone": "+923007881023",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Bazar",
      "addressLocality": "Khanewal",
      "addressRegion": "Punjab",
      "postalCode": "58150",
      "addressCountry": "PK",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 30.3015,
      "longitude": 71.9325,
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "19:00",
    },
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
