import type { NextConfig } from "next";
const config: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  images: { unoptimized: true },
};
export default config;
