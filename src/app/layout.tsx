import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "@/styles/global.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EcoPonto",
  description: "Sistema de pontos de coleta",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "EcoPonto",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f7a39",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={font.className}>
        <AuthProvider>
          <ServiceWorkerRegistrar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}