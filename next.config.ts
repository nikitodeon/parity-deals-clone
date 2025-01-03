// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//  experimental: {
//   runtime:'nodejs',
//  }
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: "edge",
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
