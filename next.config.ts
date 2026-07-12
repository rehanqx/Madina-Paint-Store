import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/**",
      },
      {
        protocol: "https",
        hostname: "madinapaintst0re.firebasestorage.app",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/admin/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/admin/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/admin/bookings',
        destination: '/dashboard/bookings',
        permanent: true,
      },
      {
        source: '/admin/inventory',
        destination: '/dashboard/inventory',
        permanent: true,
      },
      {
        source: '/admin/gallery-manager',
        destination: '/dashboard/gallery-manager',
        permanent: true,
      },
      {
        source: '/admin/services-manager',
        destination: '/dashboard/services-manager',
        permanent: true,
      },
      {
        source: '/admin/messages',
        destination: '/dashboard/messages',
        permanent: true,
      },
      {
        source: '/admin/activity-logs',
        destination: '/dashboard/activity-logs',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
