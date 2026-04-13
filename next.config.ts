import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["*.csb.app", "192.168.15.5"],
};

export default nextConfig;