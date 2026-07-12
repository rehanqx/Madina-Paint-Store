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
};

export default nextConfig;
