import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["*.csb.app", "192.168.15.9"],
};

export default withNextIntl(nextConfig);